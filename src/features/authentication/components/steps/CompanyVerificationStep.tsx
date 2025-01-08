import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const companyInfoSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  address: z.string().min(5, 'Company address is required'),
  industry: z.string().min(1, 'Industry is required'),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']),
});

type CompanyInfoInputs = z.infer<typeof companyInfoSchema>;

interface CompanyVerificationStepProps {
  personalInfo: any;
  onSubmit: (data: CompanyInfoInputs) => void;
  onBack: () => void;
}

export default function CompanyVerificationStep({
  personalInfo,
  onSubmit,
  onBack,
}: CompanyVerificationStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompanyInfoInputs>({
    resolver: zodResolver(companyInfoSchema),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Company Information</h2>
        <p className="text-gray-600">Please provide your company details</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Company Name</label>
          <input
            type="text"
            {...register('companyName')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.companyName && (
            <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Registration Number</label>
          <input
            type="text"
            {...register('registrationNumber')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.registrationNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.registrationNumber.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Company Address</label>
          <textarea
            {...register('address')}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Industry</label>
          <input
            type="text"
            {...register('industry')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.industry && (
            <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Company Size</label>
          <select
            {...register('size')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-500">201-500 employees</option>
            <option value="500+">500+ employees</option>
          </select>
          {errors.size && (
            <p className="mt-1 text-sm text-red-600">{errors.size.message}</p>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
}
