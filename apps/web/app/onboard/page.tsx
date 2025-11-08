
"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { StepForm, Step } from "@/components/ui/step-form";
import { Button } from "@/components/ui/Button";
import { Upload, User, Briefcase, Camera } from "lucide-react";
import { PageViewTracker } from "@/hooks/usePageView";
import { analytics } from "@/lib/analytics";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  whatsapp: z.string().optional(),
  category: z.string().min(1, "Please select a category"),
  languages: z.array(z.string()).min(1, "Please select at least one language"),
  sampradaya: z.string().optional(),
  serviceRadius: z.string().optional(),
  photo: z.any().optional(),
  termsAccepted: z.boolean().refine(val => val === true, "You must accept the terms")
});

type FormValues = z.infer<typeof schema>;

const categories = [
  { value: "purohit", label: "Vedic Purohit" },
  { value: "cook", label: "Cook" },
  { value: "essentials", label: "Essentials" },
  { value: "senior-care", label: "Senior Care" },
  { value: "pilgrimage", label: "Pilgrimage Guide" },
  { value: "other", label: "Other" }
];

const languages = [
  { value: "kannada", label: "Kannada" },
  { value: "tamil", label: "Tamil" },
  { value: "telugu", label: "Telugu" },
  { value: "sanskrit", label: "Sanskrit" },
  { value: "hindi", label: "Hindi" },
  { value: "english", label: "English" },
  { value: "tulu", label: "Tulu" },
  { value: "konkani", label: "Konkani" },
  { value: "malayalam", label: "Malayalam" },
  { value: "marathi", label: "Marathi" }
];

const sampradayas = [
  { value: "madhwa", label: "Madhwa" },
  { value: "smarta", label: "Smarta" },
  { value: "vaishnava", label: "Vaishnava" },
  { value: "shaivite", label: "Shaivite" },
  { value: "other", label: "Other" }
];

export default function Onboard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
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

      // Add languages as JSON string
      formData.append('languages', JSON.stringify(data.languages));

      // Add photo if exists
      const photoFile = (data as any).photo?.[0];
      if (photoFile) {
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
        analytics.trackFormSubmission('onboarding', false, {
          error: 'Submission failed',
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      setErrorMsg('Something went wrong while submitting. Please try again.');
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

  const nextStep = () => {
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
          <h2 className="title-large">Submitted for Review</h2>
          <p className="subtitle">
            Thank you for your submission! Our team will review your profile within 24-48 hours. 
            You'll receive a confirmation once your profile is approved.
          </p>
          <div className="space-y-2 text-sm text-slate-600">
            <p>What happens next:</p>
            <ul className="text-left space-y-1">
              <li>• Our team verifies your information</li>
              <li>• Background check is completed</li>
              <li>• Profile is approved and listed</li>
              <li>• You'll receive WhatsApp confirmation</li>
            </ul>
          </div>
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Back to Home
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
          <h1 className="title-large mb-2">Join Our Community</h1>
          <p className="subtitle">
            Become a verified service provider and connect with your community
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
            {errorMsg}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <StepForm 
            steps={[
              {
                title: "Identity & Contact",
                description: "Your basic information",
                stepNumber: 1,
                children: (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">
                        Full Name *
                      </label>
                      <input
                        {...register('name')}
                        className="w-full h-10 rounded-xl border border-sandstone/30 px-3
                               focus:outline-none focus:ring-2 focus:ring-saffron/40"
                        placeholder="Enter your full name"
                      />
                      {errors.name && (
                        <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">
                        Phone Number *
                      </label>
                      <input
                        {...register('phone')}
                        type="tel"
                        className="w-full h-10 rounded-xl border border-sandstone/30 px-3
                               focus:outline-none focus:ring-2 focus:ring-saffron/40"
                        placeholder="+91 98765 43210"
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">
                        WhatsApp Number (optional)
                      </label>
                      <input
                        {...register('whatsapp')}
                        type="tel"
                        className="w-full h-10 rounded-xl border border-sandstone/30 px-3
                               focus:outline-none focus:ring-2 focus:ring-saffron/40"
                        placeholder="+91 98765 43210"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Leave empty to use phone number
                      </p>
                    </div>
                  </div>
                )
              },
              {
                title: "Role & Rituals",
                description: "Your services and expertise",
                stepNumber: 2,
                children: (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">
                        Service Category *
                      </label>
                      <select
                        {...register('category')}
                        className="w-full h-10 rounded-xl border border-sandstone/30 px-3
                               focus:outline-none focus:ring-2 focus:ring-saffron/40"
                      >
                        <option value="">Select a category</option>
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="text-xs text-red-600 mt-1">{errors.category.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">
                        Languages * (select all that apply)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {languages.map(lang => (
                          <label
                            key={lang.value}
                            className="flex items-center gap-2 p-2 rounded-lg border border-sandstone/30 cursor-pointer
                                   hover:border-saffron/50 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedLanguages?.includes(lang.value)}
                              onChange={() => handleLanguageToggle(lang.value)}
                              className="rounded border-sandstone/30 text-saffron 
                                     focus:ring-2 focus:ring-saffron/40"
                            />
                            <span className="text-sm">{lang.label}</span>
                          </label>
                        ))}
                      </div>
                      {errors.languages && (
                        <p className="text-xs text-red-600 mt-1">{errors.languages.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">
                        Sampradaya/Tradition (optional)
                      </label>
                      <select
                        {...register('sampradaya')}
                        className="w-full h-10 rounded-xl border border-sandstone/30 px-3
                               focus:outline-none focus:ring-2 focus:ring-saffron/40"
                      >
                        <option value="">Select tradition</option>
                        {sampradayas.map(sam => (
                          <option key={sam.value} value={sam.value}>
                            {sam.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">
                        Service Radius (optional)
                      </label>
                      <select
                        {...register('serviceRadius')}
                        className="w-full h-10 rounded-xl border border-sandstone/30 px-3
                               focus:outline-none focus:ring-2 focus:ring-saffron/40"
                      >
                        <option value="">Select service area</option>
                        <option value="5">Within 5 km</option>
                        <option value="10">Within 10 km</option>
                        <option value="25">Within 25 km</option>
                        <option value="50">Within 50 km</option>
                        <option value="city">Within city</option>
                        <option value="any">Willing to travel anywhere</option>
                      </select>
                    </div>
                  </div>
                )
              },
              {
                title: "Photo & Terms",
                description: "Complete your profile",
                stepNumber: 3,
                children: (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 mb-1">
                        Profile Photo (optional)
                      </label>
                      <div className="border-2 border-dashed border-sandstone/30 rounded-xl p-6 text-center">
                        <Upload className="h-8 w-8 text-sandstone/70 mx-auto mb-2" />
                        <p className="text-sm text-slate-600 mb-1">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-slate-500">
                          PNG, JPG up to 5MB
                        </p>
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
                        <label
                          htmlFor="photo-upload"
                          className="inline-block mt-2 px-3 py-1 text-sm rounded-lg border border-sandstone/30 
                                 cursor-pointer hover:border-saffron/50 transition-colors"
                        >
                          Choose File
                        </label>
                        {photoPreview && (
                          <div className="mt-3">
                            <img src={photoPreview} alt="Selected preview" className="h-24 w-24 rounded-xl object-cover border" />
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
                          I agree to the <a href="/conduct" className="text-saffron hover:underline">Code of Conduct</a>, 
                          <a href="/privacy" className="text-saffron hover:underline"> Privacy Policy</a>, 
                          and <a href="/terms" className="text-saffron hover:underline">Terms of Service</a>. 
                          I understand that my information will be verified before listing.
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
