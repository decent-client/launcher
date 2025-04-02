import { useEffect, useState } from "react";
import fullFallback from "~/../public/images/fallback/full.png?url";
import faceFallback from "~/../public/images/fallback/head.png?url";
import { useSessionStorage } from "~/hooks/storage";
import { getPlayerFaceTexture, getPlayerTexture } from "~/lib/bindings/player-skin";

type PlayerTextureCache = Record<string, { face: string; skin: string }>;

const fallbackTexture = {
  face: "/images/fallback/head.png",
  skin: "/images/fallback/full.png",
};

export function usePlayerSkin(uuid?: string) {
  const [cache, setCache] = useSessionStorage<PlayerTextureCache>("player-texture-cache", {});
  const [texture, setTexture] = useState<{
    face: string;
    skin: string;
    loading: boolean;
  }>({
    face: fallbackTexture.face,
    skin: fallbackTexture.skin,
    loading: true,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!uuid) {
      setTexture({
        face: faceFallback,
        skin: fullFallback,
        loading: false,
      });
    } else {
      getPlayerTextures(uuid);

      async function getPlayerTextures(uuid: string) {
        if (cache[uuid]) {
          return setTexture({ ...cache[uuid], loading: false });
        }

        try {
          const faceTexture = await getPlayerFaceTexture(uuid);
          const skinTexture = await getPlayerTexture(uuid);

          setCache({
            ...cache,
            [uuid]: { face: faceTexture, skin: skinTexture },
          });

          setTexture({
            face: faceTexture,
            skin: skinTexture,
            loading: false,
          });
        } catch (error) {
          console.log(error);
          setTexture((prevTexture) => ({
            ...prevTexture,
            loading: false,
          }));
        }
      }
    }
  }, [uuid]);

  return texture;
}
