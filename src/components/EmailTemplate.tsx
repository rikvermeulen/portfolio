import { FC } from 'react';

interface MessageTemplateProps {
  name: string;
  reason: string;
  phone: string;
  email: string;
}

interface RecommendationTemplateProps {
  email: string;
  recommendation: string;
}

export const MessageTemplate: FC<Readonly<MessageTemplateProps>> = ({
  name,
  reason,
  phone,
  email,
}) => (
  <div className="mx-auto max-w-3xl bg-gray-100 p-6">
    <div className="mt-4 space-y-2">
      <p className="text-sm font-medium">Name:</p>
      <p className="rounded-md bg-white p-2">{name}</p>

      <p className="text-sm font-medium">Email:</p>
      <p className="rounded-md bg-white p-2">{email}</p>

      <p className="text-sm font-medium">Phone:</p>
      <p className="rounded-md bg-white p-2">{phone}</p>

      <p className="text-sm font-medium">Reason:</p>
      <p className="rounded-md bg-white p-2">{reason}</p>
    </div>
  </div>
);

export const RecommendationTemplate: FC<Readonly<RecommendationTemplateProps>> = ({
  email,
  recommendation,
}) => (
  <div className="mx-auto max-w-3xl bg-gray-100 p-6">
    <div className="mt-4 space-y-2">
      <p className="text-sm font-medium">Email:</p>
      <p className="rounded-md bg-white p-2">{email}</p>

      <p className="text-sm font-medium">Recommendation:</p>
      <p className="rounded-md bg-white p-2">{recommendation}</p>
    </div>
  </div>
);
