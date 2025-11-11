
"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardSchema, type OnboardFormValues } from "@/lib/schemas/onboard";
import { StepForm, Step } from "@/components/ui/step-form";
import { Button } from "@/components/ui/Button";
import { Upload, User, Briefcase, Camera } from "lucide-react";
import { PageViewTracker } from "@/hooks/usePageView";
import { analytics } from "@/lib/analytics";
import { useTranslations } from "next-intl";

type FormValues = OnboardFormValues;

const categories = ["purohit", "cook", "essentials", "seniorCare", "pilgrimage", "other"] as const;
const languages = ["kannada","tamil","telugu","sanskrit","hindi","english","tulu","konkani","malayalam","marathi"] as const;
const sampradayas = ["madhwa","smarta","vaishnava","shaivite","other"] as const;

export default function Onboard() {
  const t = useTranslations("onboard");
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  
  const { register, handleSubmit, watch, setValue, reset, trigger, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(onboardSchema),
    mode: 'onChange',
    defaultValues: {
      languages: [],
      termsAccepted: false
    }
  });

  const selectedLanguages = watch("languages");

  // Track onboarding start on first interaction
  useEffect(() => {
    if (!hasStarted) {
      analytics.trackOnboardingStep('started', {
        timestamp: new Date().toISOString(),
      });
      setHasStarted(true);
    }
  }, [hasStarted]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      
      // Add all form fields except photo and languages array
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'photo' && key !== 'languages') {
          formData.append(key, String(value || ''));
        }
      });

      // Add languages as CSV to match server expectation
      formData.append('languages', (data.languages || []).join(','));

      // Add photo if exists (read directly from DOM input to avoid RHF edge cases)
      const inputEl = document.getElementById('photo-upload') as HTMLInputElement | null;
      const photoFile = inputEl?.files?.[0] || (data as any).photo?.[0];
      if (photoFile) {
        // Basic client-side validation
        const allowed = ['image/jpeg','image/jpg','image/png','image/webp'];
        if (!allowed.includes(photoFile.type)) {
          throw new Error('Invalid photo type. Use JPEG, PNG, or WebP.');
        }
        if (photoFile.size > 5 * 1024 * 1024) {
          throw new Error('Photo too large. Max 5MB.');
        }
        formData.append('photo', photoFile);
      }

      const response = await fetch('/api/onboard', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setIsSubmitted(true);
        
        // Get provider data from response if available
        let providerData = null;
        try {
          providerData = await response.json();
        } catch {}
        
        // Track onboarding completion with new conversion function
        analytics.trackOnboardingCompleted(
          providerData?.id || 'unknown',
          data.name,
          data.category
        );
        
        analytics.trackOnboardingStep('completed', {
          category: data.category,
          languages: data.languages,
          sampradaya: data.sampradaya,
          serviceRadius: data.serviceRadius,
          hasPhoto: !!photoFile,
          hasWhatsApp: !!data.whatsapp,
        });
        
        analytics.trackFormSubmission('onboarding', true, {
          category: data.category,
          completionTime: Date.now(),
        });
        
        // Clear draft on success
        try { localStorage.removeItem('onboardDraft'); } catch {}
      } else {
        // Surface server error to the user
        let serverMsg = t('errors.serverPrefix');
        try {
          const errJson = await response.json();
          if (errJson?.error) serverMsg = errJson.error;
        } catch {}
        setErrorMsg(serverMsg);
        analytics.trackFormSubmission('onboarding', false, {
          error: serverMsg,
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      setErrorMsg(t('errors.submitGeneric'));
      analytics.trackFormSubmission('onboarding', false, {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLanguageToggle = (language: string) => {
    const currentLanguages = selectedLanguages || [];
    if (currentLanguages.includes(language)) {
      setValue('languages', currentLanguages.filter(l => l !== language));
    } else {
      setValue('languages', [...currentLanguages, language]);
    }
  };

  const nextStep = async () => {
    // Validate required fields for the current step before advancing
    let fields: Array<keyof FormValues> = [];
    if (currentStep === 0) fields = ['name', 'phone'];
    if (currentStep === 1) fields = ['category', 'languages'];
    if (currentStep === 2) fields = ['termsAccepted'];

    const ok = await trigger(fields as any, { shouldFocus: true });
    if (!ok) return; // stay on current step until valid

    if (currentStep < 2) {
      const nextStepNumber = currentStep + 1;
      setCurrentStep(nextStepNumber);
      // Track step completion
      const stepNames = ['identity_contact', 'role_rituals', 'photo_terms'];
      analytics.trackOnboardingStep(stepNames[nextStepNumber], {
        stepNumber: nextStepNumber + 1,
        totalSteps: 3,
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // --- Autosave draft (localStorage) ---
  // Restore draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('onboardDraft');
      if (raw) {
        const parsed = JSON.parse(raw);
        // only set known fields
        reset({
          name: parsed.name || '',
          phone: parsed.phone || '',
          whatsapp: parsed.whatsapp || '',
          category: parsed.category || '',
          languages: Array.isArray(parsed.languages) ? parsed.languages : [],
          sampradaya: parsed.sampradaya || '',
          serviceRadius: parsed.serviceRadius || '',
          // photo cannot be restored (file object); ignore
          termsAccepted: !!parsed.termsAccepted
        });
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save draft whenever values change (debounced via useEffect)
  const watchedValues = watch();
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        const { photo, ...safe } = watchedValues as any;
        localStorage.setItem('onboardDraft', JSON.stringify(safe));
      } catch {}
    }, 400);
    return () => clearTimeout(id);
  }, [watchedValues]);

  // Cleanup photo preview URL on unmount or when changed
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <svg className="h-8 w-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="title-large">{t('submitted.title')}</h2>
          <p className="subtitle">{t('submitted.subtitle')}</p>
          <div className="space-y-2 text-sm text-slate-600">
            <p>{t('submitted.nextTitle')}</p>
            <ul className="text-left space-y-1">
              <li>• {t('submitted.nextItems.verify')}</li>
              <li>• {t('submitted.nextItems.bgCheck')}</li>
              <li>• {t('submitted.nextItems.approved')}</li>
              <li>• {t('submitted.nextItems.whatsapp')}</li>
            </ul>
          </div>
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            {t('submitted.backToHome')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen section-padding">
      <PageViewTracker />
      <div className="container-custom max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="title-large mb-2">{t('title')}</h1>
          <p className="subtitle">{t('subtitle')}</p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">{errorMsg}</div>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <StepForm 
            steps={[
              {
                title: t('steps.identity.title'),
                description: t('steps.identity.desc'),
                stepNumber: 1,
                children: (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">{t('fields.name.label')}</label>
                      <input
                        {...register('name')}
                        className="w-full h-10 rounded-xl border border-sandstone/30 px-3
                               focus:outline-none focus:ring-2 focus:ring-saffron/40"
                        placeholder={t('fields.name.placeholder')}
                      />
                      {errors.name && (
                        <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">{t('fields.phone.label')}</label>
                      <input
                        {...register('phone')}
                        type="tel"
                        className="w-full h-10 rounded-xl border border-sandstone/30 px-3
                               focus:outline-none focus:ring-2 focus:ring-saffron/40"
                        placeholder={t('fields.phone.placeholder')}
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">{t('fields.whatsapp.label')}</label>
                      <input
                        {...register('whatsapp')}
                        type="tel"
                        className="w-full h-10 rounded-xl border border-sandstone/30 px-3
                               focus:outline-none focus:ring-2 focus:ring-saffron/40"
                        placeholder={t('fields.phone.placeholder')}
                      />
                      <p className="text-xs text-slate-500 mt-1">{t('fields.whatsapp.note')}</p>
                    </div>
                  </div>
                )
              },
              {
                title: t('steps.role.title'),
                description: t('steps.role.desc'),
                stepNumber: 2,
                children: (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">{t('fields.category.label')}</label>
                      <select
                        {...register('category')}
                        data-testid="category-select"
                        className="w-full h-10 rounded-xl border border-sandstone/30 px-3
                               focus:outline-none focus:ring-2 focus:ring-saffron/40"
                      >
                        <option value="">{t('fields.category.placeholder')}</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>
                            {t(`options.categories.${cat}` as any)}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="text-xs text-red-600 mt-1">{errors.category.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">{t('fields.languages.label')}</label>
                      <div className="grid grid-cols-2 gap-2">
                        {languages.map(lang => (
                          <label
                            key={lang}
                            className="flex items-center gap-2 p-2 rounded-lg border border-sandstone/30 cursor-pointer
                                   hover:border-saffron/50 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedLanguages?.includes(lang)}
                              onChange={() => handleLanguageToggle(lang)}
                              data-testid={`lang-${lang}`}
                              className="rounded border-sandstone/30 text-saffron 
                                     focus:ring-2 focus:ring-saffron/40"
                            />
                            <span className="text-sm">{t(`options.languages.${lang}` as any)}</span>
                          </label>
                        ))}
                      </div>
                      {errors.languages && (
                        <p className="text-xs text-red-600 mt-1">{errors.languages.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">{t('fields.sampradaya.label')}</label>
                      <select
                        {...register('sampradaya')}
                        className="w-full h-10 rounded-xl border border-sandstone/30 px-3
                               focus:outline-none focus:ring-2 focus:ring-saffron/40"
                      >
                        <option value="">{t('fields.sampradaya.placeholder')}</option>
                        {sampradayas.map(sam => (
                          <option key={sam} value={sam}>
                            {t(`options.sampradayas.${sam}` as any)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">{t('fields.serviceRadius.label')}</label>
                      <select
                        {...register('serviceRadius')}
                        className="w-full h-10 rounded-xl border border-sandstone/30 px-3
                               focus:outline-none focus:ring-2 focus:ring-saffron/40"
                      >
                        <option value="">{t('fields.serviceRadius.placeholder')}</option>
                        <option value="5">{t('fields.serviceRadius.options.w5')}</option>
                        <option value="10">{t('fields.serviceRadius.options.w10')}</option>
                        <option value="25">{t('fields.serviceRadius.options.w25')}</option>
                        <option value="50">{t('fields.serviceRadius.options.w50')}</option>
                        <option value="city">{t('fields.serviceRadius.options.city')}</option>
                        <option value="any">{t('fields.serviceRadius.options.any')}</option>
                      </select>
                    </div>
                  </div>
                )
              },
              {
                title: t('steps.photo.title'),
                description: t('steps.photo.desc'),
                stepNumber: 3,
                children: (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">{t('upload.photoLabel')}</label>
                      <div className="border-2 border-dashed border-sandstone/30 rounded-xl p-6 text-center">
                        <Upload className="h-8 w-8 text-sandstone/70 mx-auto mb-2" />
                        <p className="text-sm text-slate-600 mb-1">{t('upload.cta')}</p>
                        <p className="text-xs text-slate-500">{t('upload.help')}</p>
                        <input
                          {...register('photo')}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="photo-upload"
                          onChange={(e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              const url = URL.createObjectURL(file);
                              setPhotoPreview(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
                            } else {
                              setPhotoPreview(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('photo-upload') as HTMLInputElement | null;
                            input?.click();
                          }}
                          className="inline-block mt-2 px-3 py-1 text-sm rounded-lg border border-sandstone/30 
                                 cursor-pointer hover:border-saffron/50 transition-colors"
                        >
                          {t('upload.chooseFile')}
                        </button>
                        {photoPreview && (
                          <div className="mt-3">
                            <img src={photoPreview} alt={t('upload.previewAlt')} className="h-24 w-24 rounded-xl object-cover border" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          {...register('termsAccepted')}
                          type="checkbox"
                          className="mt-1 rounded border-sandstone/30 text-saffron 
                                 focus:ring-2 focus:ring-saffron/40"
                        />
                        <span className="text-sm text-slate-700">
                          {t.rich('terms.label', {
                            conduct: (chunks) => <a href="/conduct" className="text-saffron hover:underline">{t('terms.conduct')}</a>,
                            privacy: (chunks) => <a href="/privacy" className="text-saffron hover:underline">{t('terms.privacy')}</a>,
                            terms: (chunks) => <a href="/terms" className="text-saffron hover:underline">{t('terms.termsOfService')}</a>,
                          })}
                        </span>
                      </label>
                      {errors.termsAccepted && (
                        <p className="text-xs text-red-600 mt-1">{errors.termsAccepted.message}</p>
                      )}
                    </div>
                  </div>
                )
              }
            ]}
            currentStep={currentStep}
            onNext={nextStep}
            onPrev={prevStep}
            onSubmit={handleSubmit(onSubmit)}
            isLastStep={currentStep === 2}
            isSubmitting={isSubmitting}
          />
        </form>
      </div>
    </div>
  );
}
