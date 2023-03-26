export const flags: any = {
  "fr": ["U+1F1EB", "U+1F1F7"],
  "en": ["U+1F1FA", "U+1F1F8"],
}

export const Flag = (props: { countryCode: string }) => {
  const [firstCode, secondCode] = flags[props.countryCode];

  const firstChar = String.fromCodePoint(parseInt(firstCode.replace("U+", ""), 16));
  const secondChar = String.fromCodePoint(parseInt(secondCode.replace("U+", ""), 16));

  return (
    <span role="img" aria-label={`${props.countryCode} Flag`}>
      {firstChar}
      {secondChar}
    </span>
  );
}
