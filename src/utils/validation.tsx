export const isValidEmail = (email: string) => {
  const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  return re.test(String(email).toLowerCase());
};

export const isValidPhoneNumber = (phone: string) => {
  const re = /^(\+?\d{1,3}[-.\s]?)?\(?[\d\s]{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,4}$/;
  return re.test(phone);
};

export const hasEnoughText = (text: string) => text.trim().length >= 2;
