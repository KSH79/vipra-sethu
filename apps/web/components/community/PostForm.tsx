"use client";

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

interface FieldOption { value: string; label: string }
interface FieldDef {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'date' | 'datetime-local' | 'tel'
  required?: boolean
  placeholder?: string
  options?: FieldOption[]
}

interface PostFormProps {
  fields: FieldDef[]
  onSubmit: (data: any, status: 'draft' | 'pending') => Promise<void>
  saving: boolean
  initialData?: any
  extraContent?: React.ReactNode
}

export default function PostForm({ fields, onSubmit, saving, initialData = {}, extraContent }: PostFormProps) {
  const t = useTranslations('community')
  const router = useRouter()
  const [formData, setFormData] = useState<any>(initialData)
  const [showPreview, setShowPreview] = useState(false)

  function handleChange(name: string, value: any) {
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  async function handleSaveDraft() {
    await onSubmit(formData, 'draft')
  }

  async function handleSubmit() {
    await onSubmit(formData, 'pending')
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      {!showPreview ? (
        <>
          <form className="space-y-6">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">{t('form.selectPlaceholder')}</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                )}
              </div>
            ))}

            {extraContent}
          </form>

          <div className="flex justify-between mt-8 pt-6 border-t">
            <button type="button" onClick={() => router.back()} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              {t('cancel')}
            </button>

            <div className="flex gap-3">
              <button type="button" onClick={handleSaveDraft} disabled={saving} className="px-6 py-3 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 disabled:opacity-50">
                {t('saveDraft')}
              </button>
              <button type="button" onClick={() => setShowPreview(true)} className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                {t('preview')}
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">{formData.title}</h2>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{formData.body}</p>
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t">
            <button onClick={() => setShowPreview(false)} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
              ← {t('edit')}
            </button>
            <button onClick={handleSubmit} disabled={saving} className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-semibold">
              {t('submitForReview')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
