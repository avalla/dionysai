import say from "say";

/**
 * Pronuncia il testo fornito tramite TTS.
 * @param text Il testo da pronunciare.
 * @param voice (opzionale) Voce da usare.
 * @param speed (opzionale) Velocità di lettura.
 */
export function speak(text: string, voice?: string, speed?: number): Promise<void> {
    return new Promise((resolve, reject) => {
        say.speak(text, voice, speed, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}