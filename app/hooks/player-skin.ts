import { useEffect, useMemo, useState } from "react";
import { getPlayerFace, getPlayerSkin } from "~/lib/bindings/player-skin";

type SkinUrls = {
  face: string;
  skin: string;
};

const cache = new Map<string, SkinUrls>();

const FALLBACKS: SkinUrls = {
  face: "/images/fallback/face.png",
  skin: "/images/fallback/skin.png",
};

export function usePlayerSkin(uuid?: string) {
  const [urls, setUrls] = useState<SkinUrls>(() => {
    if (!uuid) return FALLBACKS;
    return cache.get(uuid) ?? FALLBACKS;
  });

  const [loading, setLoading] = useState(() => !!uuid && !cache.has(uuid));

  const fetchBoth = useMemo(
    () => async (uuid: string) => {
      const [face, skin] = await Promise.all([getPlayerFace(uuid, 8), getPlayerSkin(uuid)]);

      return { face, skin };
    },
    [],
  );

  useEffect(() => {
    let mounted = true;

    if (!uuid) {
      setUrls(FALLBACKS);
      setLoading(false);
      return;
    }

    const cached = cache.get(uuid);
    if (cached) {
      setUrls(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    (async () => {
      try {
        const result = await fetchBoth(uuid);

        if (mounted) {
          cache.set(uuid, result);
          setUrls(result);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [uuid, fetchBoth]);

  return {
    face: urls.face,
    skin: urls.skin,
    loading,
  } as const;
}
