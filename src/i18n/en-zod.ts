import i18next from "i18next";
import { z } from "zod";
import { zodI18nMap } from "zod-i18n-map";
import idTranslation from "zod-i18n-map/locales/id/zod.json";
import enTranslation from "zod-i18n-map/locales/en/zod.json";


i18next.init({
    lng: "id",
    resources: {
        id: { zod: idTranslation },
        en: { zod: enTranslation }
    },
});
z.setErrorMap(zodI18nMap);

export { z }