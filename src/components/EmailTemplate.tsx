import * as React from 'react';

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

export const MessageTemplate: React.FC<Readonly<MessageTemplateProps>> = ({
  name,
  reason,
  phone,
  email,
}) => (
  <div>
    <h1>Contact form submision: rikvermeulen.com</h1>
    <p>name: {name}</p>
    <p>email: {email}</p>
    <p>phone: {phone}</p>
    <p>reason: {reason}</p>
  </div>
);

export const RecommendationTemplate: React.FC<Readonly<RecommendationTemplateProps>> = ({
  email,
  recommendation,
}) => (
  <div>
    <h1>Contact form submision: rikvermeulen.com</h1>
    <p>email: {email}</p>
    <p>Recommendation: {recommendation}</p>
  </div>
);
