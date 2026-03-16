/**
 * Formate un nombre en devise Euro (fr-FR).
 * @param {number} montant - La valeur numérique à formater.
 * @returns {string} - Le montant formaté avec le symbole €.
 */
const formatMonnaie = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(montant);
};

/**
 * Calcule les données du tableau d'amortissement.
 * @param {number} v0 - Capital emprunté.
 * @param {number} tAnnuel - Taux d'intérêt annuel (décimal).
 * @param {number} annees - Durée du prêt.
 * @param {number} k - Périodicité (12 pour mois, 1 pour an, etc.).
 * @param {string} methode - 'annuite' ou 'amortissement'.
 * @returns {Object} - Contient le tableau de données et les cumuls.
 */
const calculerDonnees = (v0, tAnnuel, annees, k, methode) => {
    const n = annees * k;
    const i = tAnnuel / k;
    let capitalRestant = v0;
    let lignes = [];
    let cumulInterets = 0;

    // Calcul de la mensualité constante si nécessaire
    const annuiteConstante = methode === 'annuite' 
        ? v0 * (i / (1 - Math.pow(1 + i, -n))) 
        : 0;

    const amortissementConstant = v0 / n;

    for (let p = 1; p <= n; p++) {
        const interetP = capitalRestant * i;
        let amortP, annuiteP;

        if (methode === 'annuite') {
            annuiteP = annuiteConstante;
            amortP = annuiteP - interetP;
        } else {
            amortP = amortissementConstant;
            annuiteP = amortP + interetP;
        }

        const capitalFin = capitalRestant - amortP;

        lignes.push({
            periode: p,
            debut: capitalRestant,
            interet: interetP,
            amort: amortP,
            annuite: annuiteP,
            fin: Math.max(0, capitalFin)
        });

        cumulInterets += interetP;
        capitalRestant = capitalFin;
    }

    return { lignes, cumulInterets, totalVerse: cumulInterets + v0 };
};

/**
 * Gère l'événement de clic et met à jour le DOM.
 */
document.getElementById('btnCalculer').addEventListener('click', () => {
    // Récupération des valeurs
    const capital = parseFloat(document.getElementById('capital').value);
    const taux = parseFloat(document.getElementById('taux').value) / 100;
    const duree = parseInt(document.getElementById('duree').value);
    const k = parseInt(document.getElementById('periodicite').value);
    const methode = document.getElementById('methode').value;

    if (isNaN(capital) || isNaN(taux) || isNaN(duree)) {
        alert("Veuillez remplir tous les champs correctement.");
        return;
    }

    const { lignes, cumulInterets, totalVerse } = calculerDonnees(capital, taux, duree, k, methode);

    // Mise à jour du résumé
    document.getElementById('bilan').innerHTML = `
        <div><label>Intérêts totaux</label><div style="font-size:1.2rem; font-weight:bold">${formatMonnaie(cumulInterets)}</div></div>
        <div><label>Total à rembourser</label><div style="font-size:1.2rem; font-weight:bold">${formatMonnaie(totalVerse)}</div></div>
        <div><label>Coût du crédit</label><div style="font-size:1.2rem; font-weight:bold">${((cumulInterets/capital)*100).toFixed(2)}%</div></div>
    `;

    // Génération du tableau
    let html = "";
    lignes.forEach(l => {
        html += `<tr>
            <td>${l.periode}</td>
            <td>${formatMonnaie(l.debut)}</td>
            <td>${formatMonnaie(l.interet)}</td>
            <td>${formatMonnaie(l.amort)}</td>
            <td>${formatMonnaie(l.annuite)}</td>
            <td>${formatMonnaie(l.fin)}</td>
        </tr>`;
    });

    // Ligne de total
    html += `<tr class="total-row">
        <td>TOTAL</td>
        <td>-</td>
        <td>${formatMonnaie(cumulInterets)}</td>
        <td>${formatMonnaie(capital)}</td>
        <td>${formatMonnaie(totalVerse)}</td>
        <td>-</td>
    </tr>`;

    document.getElementById('corps-tableau').innerHTML = html;
    document.getElementById('resultats').style.display = 'block';
});