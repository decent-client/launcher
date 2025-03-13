import { useEffect, useState } from "react";
import { getPlayerFaceTexture, getPlayerTexture } from "~/lib/bindings/player-skin";

type PlayerTexture = {
  face: string;
  skin: string;
  loading: boolean;
};

export function usePlayerSkin(uuid: string) {
  const [texture, setTexture] = useState<PlayerTexture>({
    face: "/images/fallback/head.png",
    skin: "/images/fallback/head.png",
    loading: true,
  });

  useEffect(() => {
    async function getPlayerTextures(uuid: string) {
      try {
        const faceTexture = await getPlayerFaceTexture(uuid);
        const skinTexture = await getPlayerTexture(uuid);

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

    getPlayerTextures(uuid);
  }, [uuid]);

  return texture;
}
