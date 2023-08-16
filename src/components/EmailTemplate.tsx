import * as React from 'react';

interface EmailTemplateProps {
  name: string;
  reason: string;
  phone: string;
  email: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
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

export default EmailTemplate;
