import { fromFormatExplain } from "../../../src/parse";

const keyCount = o => Object.keys(o).length;

test("DateTime.fromFormatExplain() explains success", () => {
  const ex = fromFormatExplain("May 25, 1982 09:10:12.445", "MMMM dd, yyyy HH:mm:ss.SSS");
  expect(ex.tokens).toBeInstanceOf(Array);
  expect(ex.matches).toBeInstanceOf(Array);
  expect(ex.fields).toBeInstanceOf(Object);
  expect(keyCount(ex.fields)).toBe(7);
});

 test("DateTime.fromFormatExplain() explains a bad match", () => {
   const ex = fromFormatExplain("May 25, 1982 09:10:12.445", "MMMM dd, yyyy mmmm");
   expect(ex.tokens).toBeInstanceOf(Array);
   expect(ex.matches).toBeNull();
   expect(ex.fields).toBeNull()
 });

test("DateTime.fromFormatExplain() parses zone correctly", () => {
  const ex = fromFormatExplain(
    "America/New_York 1-April-2019 04:10:48 PM Mon",
    "z d-MMMM-yyyy hh:mm:ss a EEE"
  );
  expect(ex.fields).toEqual({
    E: 1,
    M: 4,
    a: 1,
    d: 1,
    h: 4,
    m: 10,
    s: 48,
    y: 2019,
    z: "America/New_York",
  });
});

test("DateTime.fromFormatExplain() takes the same options as fromFormat", () => {
  const ex = fromFormatExplain("Janv. 25 1982", "LLL dd yyyy", { locale: "fr" });
  expect(keyCount(ex.fields)).toBe(3);
});

test("fromFormatExplain() parses localized string with numberingSystem correctly: knda", () => {
  const ex1 = fromFormatExplain(
    "೦೩-ಏಪ್ರಿಲ್-೨೦೧೯ ೧೨:೨೬:೦೭ ಅಪರಾಹ್ನ Asia/Calcutta",
    "dd-MMMM-yyyy hh:mm:ss a z",
    { locale: "kn", numberingSystem: "knda" }
  );

  expect(ex1.fields).toEqual({
    M: 4,
    a: 1,
    d: 3,
    h: 12,
    m: 26,
    s: 7,
    y: 2019,
    z: "Asia/Calcutta",
  });
});

// test("fromFormatExplain() parses localized string with numberingSystem correctly: hanidec", () => {
//   const ex2 = fromFormatExplain(
//     "〇三-四-二〇一九 一二:三四:四九 下午 Asia/Shanghai",
//     "dd-MMMM-yyyy hh:mm:ss a z",
//     { locale: "zh", numberingSystem: "hanidec" }
//   );
//
//   console.log(ex2);
//
//   expect(ex2.fields).toEqual({
//     M: 4,
//     a: 1,
//     d: 3,
//     h: 12,
//     m: 34,
//     s: 49,
//     y: 2019,
//     z: "Asia/Shanghai",
//   });
// });

test("fromFormatExplain() parses localized string with numberingSystem correctly: arab", () => {
  const ex3 = fromFormatExplain("٠٣-أبريل-٢٠١٩ ٠٣:٤٦:٠١ م", "dd-MMMM-yyyy hh:mm:ss a", {
    locale: "ar",
    numberingSystem: "arab",
  });
  expect(ex3.fields).toEqual({
    M: 4,
    a: 1,
    d: 3,
    h: 3,
    m: 46,
    s: 1,
    y: 2019,
  });
});

test("fromFormatExplain() parses localized string with numberingSystem correctly: misc", () => {
  const ex4 = fromFormatExplain("۰۳-أبريل-۲۰۱۹ ۰۳:۴۷:۲۱ م", "dd-MMMM-yyyy hh:mm:ss a", {
    locale: "ar",
    numberingSystem: "arabext",
  });
  expect(ex4).not.toBeNull();

  const ex5 = fromFormatExplain("᭐᭓-April-᭒᭐᭑᭙ ᭐᭒:᭔᭔:᭐᭗ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    locale: "id",
    numberingSystem: "bali",
  });
  expect(ex5).not.toBeNull();

  const ex6 = fromFormatExplain("০৩ এপ্রিল ২০১৯ ১২.৫৭", "dd MMMM yyyy hh.mm", {
    locale: "bn",
    numberingSystem: "beng",
  });
  expect(ex6.fields).toEqual({
    M: 4,
    d: 3,
    h: 12,
    m: 57,
    y: 2019,
  });

  const ex7 = fromFormatExplain(
    "０３-April-２０１９ ０２:４７:０４ PM",
    "dd-MMMM-yyyy hh:mm:ss a",
    {
      locale: "en-US",
      numberingSystem: "fullwide",
    }
  );
  expect(ex7).not.toBeNull();

  const ex8 = fromFormatExplain("०३-April-२०१९ ०२:५३:१९ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    numberingSystem: "deva",
  });
  expect(ex8).not.toBeNull();

  const ex9 = fromFormatExplain("૦૩-એપ્રિલ-૨૦૧૯ ૦૨:૫૫:૨૧ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    locale: "gu",
    numberingSystem: "gujr",
  });
  expect(ex9).not.toBeNull();

  const ex10 = fromFormatExplain("០៣-April-២០១៩ ០៣:៤៩:២០ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    numberingSystem: "khmr",
  });
  expect(ex10).not.toBeNull();

  const ex11 = fromFormatExplain("໐໓-April-໒໐໑໙ ໐໓:໕໒:໑໑ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    numberingSystem: "laoo",
  });
  expect(ex11).not.toBeNull();

  const ex12 = fromFormatExplain("᥆᥉-April-᥈᥆᥇᥏ ᥆᥉:᥋᥉:᥇᥎ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    numberingSystem: "limb",
  });
  expect(ex12).not.toBeNull();

  const ex13 = fromFormatExplain("൦൩-ഏപ്രിൽ-൨൦൧൯ ൦൩:൫൪:൦൮ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    locale: "ml",
    numberingSystem: "mlym",
  });
  expect(ex13).not.toBeNull();

  const ex14 = fromFormatExplain("᠐᠓-April-᠒᠐᠑᠙ ᠐᠓:᠕᠖:᠑᠙ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    numberingSystem: "mong",
  });
  expect(ex14).not.toBeNull();

  const ex15 = fromFormatExplain("୦୩-April-୨୦୧୯ ୦୩:୫୮:୪୩ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    numberingSystem: "orya",
  });
  expect(ex15).not.toBeNull();

  const ex16 = fromFormatExplain(
    "௦௩-ஏப்ரல்-௨௦௧௯ ௦௪:௦௦:௪௧ பிற்பகல்",
    "dd-MMMM-yyyy hh:mm:ss a",
    {
      locale: "ta",
      numberingSystem: "tamldec",
    }
  );
  expect(ex16).not.toBeNull();

  const ex17 = fromFormatExplain(
    "౦౩-ఏప్రిల్-౨౦౧౯ ౦౪:౦౧:౩౩ PM",
    "dd-MMMM-yyyy hh:mm:ss a",
    {
      locale: "te",
      numberingSystem: "telu",
    }
  );
  expect(ex17).not.toBeNull();

  const ex18 = fromFormatExplain(
    "๐๓-เมษายน-๒๐๑๙ ๐๔:๐๒:๒๔ หลังเที่ยง",
    "dd-MMMM-yyyy hh:mm:ss a",
    {
      locale: "th",
      numberingSystem: "thai",
    }
  );
  expect(ex18).not.toBeNull();

  const ex19 = fromFormatExplain("༠༣-April-༢༠༡༩ ༠༤:༠༣:༢༥ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    numberingSystem: "tibt",
  });
  expect(ex19).not.toBeNull();

  const ex20 = fromFormatExplain("၀၃-April-၂၀၁၉ ၀၄:၁၀:၀၁ PM", "dd-MMMM-yyyy hh:mm:ss a", {
    numberingSystem: "mymr",
  });
  expect(ex20).not.toBeNull();
});