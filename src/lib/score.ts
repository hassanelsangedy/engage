
export function calculateScore(workouts: number, weeksActive: number) {
    // Score logic
    // Frequency (workouts/month):
    // 0-2: 1 pt
    // 3-5: 2 pts
    // 6-9: 3 pts
    // 10+: 4 pts
    let freqScore = 1;
    if (workouts >= 10) freqScore = 4;
    else if (workouts >= 6) freqScore = 3;
    else if (workouts >= 3) freqScore = 2;

    // Consistency (weeks active): 
    // 0-1: 1 pt
    // 2: 2 pts
    // 3: 3 pts
    // 4: 4 pts
    let consScore = 1;
    if (weeksActive >= 4) consScore = 4;
    else if (weeksActive >= 3) consScore = 3;
    else if (weeksActive >= 2) consScore = 2;

    const total = freqScore + consScore;

    // Bands
    let band = "Green";
    if (total <= 3) band = "Red";
    else if (total <= 5) band = "Yellow";
    else if (total >= 8) band = "Blue";

    // Barrier Diagnosis
    let barrier = "Desconhecida";
    if (workouts <= 4 && weeksActive <= 2) {
        barrier = "Monotonia / Baixa Autoeficácia";
    } else if (workouts > 8 && weeksActive < 3) {
        barrier = "Falta de Tempo / Sobrecarga";
    } else if (band === "Red") {
        barrier = "Perda de Sentido / Social";
    }

    return { freqScore, consScore, total, band, barrier };
}
