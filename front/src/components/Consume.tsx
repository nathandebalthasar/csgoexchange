import { useEffect } from "react";

const Consume = () => {
  const params = new URLSearchParams(window.location.href.split('?')[1]);
  const userSession = params.get('userSession');
  if (userSession)
    document.cookie = `userSession=${userSession};SameSite=None;Secure;Path=/`;
  useEffect(() => {
    window.location.replace(`/`);
  });

  return null;
};

export default Consume;
