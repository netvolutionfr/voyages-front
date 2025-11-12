import React from 'react';
import { AlertCircle, Pill, Phone, Shield, Info, Check } from 'lucide-react';

export default function StudentHealthFormImproved() {
    const [formData, setFormData] = React.useState({
        drugAllergies: '',
        foodAllergies: '',
        otherAllergies: '',
        allergiesNotes: '',
        dailyTreatments: '',
        emergencyTreatments: '',
        hasPAI: false,
        paiDetails: '',
        primaryName: '',
        primaryRelation: '',
        primaryPhone: '',
        primaryAltPhone: '',
        secondaryName: '',
        secondaryRelation: '',
        secondaryPhone: '',
        backupName: '',
        backupRelation: '',
        backupPhone: '',
        consentHospitalization: false,
        consentTransport: false,
        rgpdConsent: false,
        validUntil: ''
    });

    const [isSaving, setIsSaving] = React.useState(false);

    const handleSubmit = (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            console.log('Form submitted:', formData);
            alert('Formulaire enregistré !');
            setIsSaving(false);
        }, 1000);
    };

    const handleReset = () => {
        if (confirm('Réinitialiser tous les champs ?')) {
            setFormData({
                drugAllergies: '',
                foodAllergies: '',
                otherAllergies: '',
                allergiesNotes: '',
                dailyTreatments: '',
                emergencyTreatments: '',
                hasPAI: false,
                paiDetails: '',
                primaryName: '',
                primaryRelation: '',
                primaryPhone: '',
                primaryAltPhone: '',
                secondaryName: '',
                secondaryRelation: '',
                secondaryPhone: '',
                backupName: '',
                backupRelation: '',
                backupPhone: '',
                consentHospitalization: false,
                consentTransport: false,
                rgpdConsent: false,
                validUntil: ''
            });
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto max-w-4xl p-4 py-8 space-y-6">
                {/* En-tête */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Fiche santé & autorisations</h1>
                    <div className="flex gap-3 rounded-lg border bg-muted/50 p-4">
                        <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Ces informations sont <span className="font-medium text-foreground">confidentielles</span> et uniquement accessibles par les administrateurs autorisés de l'établissement et les encadrants lors des sorties. Elles sont protégées conformément au RGPD.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Allergies */}
                    <div className="rounded-lg border bg-card shadow-sm">
                        <div className="border-b bg-muted/50 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                <h2 className="text-lg font-semibold">Allergies</h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">
                                    Médicamenteuses
                                </label>
                                <input
                                    type="text"
                                    value={formData.drugAllergies}
                                    onChange={(e) => setFormData({...formData, drugAllergies: e.target.value})}
                                    placeholder="Ex: pénicilline, ibuprofène"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">
                                    Alimentaires
                                </label>
                                <input
                                    type="text"
                                    value={formData.foodAllergies}
                                    onChange={(e) => setFormData({...formData, foodAllergies: e.target.value})}
                                    placeholder="Ex: arachide, gluten, lactose"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">
                                    Autres
                                </label>
                                <input
                                    type="text"
                                    value={formData.otherAllergies}
                                    onChange={(e) => setFormData({...formData, otherAllergies: e.target.value})}
                                    placeholder="Ex: latex, piqûres d'insectes"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">
                                    Précisions
                                </label>
                                <textarea
                                    value={formData.allergiesNotes}
                                    onChange={(e) => setFormData({...formData, allergiesNotes: e.target.value})}
                                    placeholder="Détails utiles : gravité, protocole en cas de réaction, EpiPen..."
                                    rows={3}
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Traitements */}
                    <div className="rounded-lg border bg-card shadow-sm">
                        <div className="border-b bg-muted/50 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <Pill className="h-5 w-5" />
                                <h2 className="text-lg font-semibold">Traitements</h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">
                                    Quotidiens
                                </label>
                                <textarea
                                    value={formData.dailyTreatments}
                                    onChange={(e) => setFormData({...formData, dailyTreatments: e.target.value})}
                                    placeholder="Ex: Vitamine D (1/jour) ; Ventoline (2 prises/jour)"
                                    rows={2}
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">
                                    En cas d'urgence
                                </label>
                                <textarea
                                    value={formData.emergencyTreatments}
                                    onChange={(e) => setFormData({...formData, emergencyTreatments: e.target.value})}
                                    placeholder="Ex: EpiPen ; Sucre en cas d'hypoglycémie"
                                    rows={2}
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                                <label className="text-sm font-medium leading-none cursor-pointer">
                                    PAI (Projet d'Accueil Individualisé) existant
                                </label>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={formData.hasPAI}
                                    onClick={() => setFormData({...formData, hasPAI: !formData.hasPAI})}
                                    className={`inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                                        formData.hasPAI ? 'bg-primary' : 'bg-input'
                                    }`}
                                >
                  <span
                      className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                          formData.hasPAI ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                                </button>
                            </div>

                            {formData.hasPAI && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">
                                        Détails PAI
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.paiDetails}
                                        onChange={(e) => setFormData({...formData, paiDetails: e.target.value})}
                                        placeholder="Ex: signé le 01/09/2025"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contacts d'urgence */}
                    <div className="rounded-lg border bg-card shadow-sm">
                        <div className="border-b bg-muted/50 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <Phone className="h-5 w-5" />
                                <h2 className="text-lg font-semibold">Contacts d'urgence</h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Contact principal */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-px flex-1 bg-border" />
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact principal</span>
                                    <div className="h-px flex-1 bg-border" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">
                                            Nom et prénom <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.primaryName}
                                            onChange={(e) => setFormData({...formData, primaryName: e.target.value})}
                                            placeholder="Nom complet"
                                            required
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">
                                            Lien <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.primaryRelation}
                                            onChange={(e) => setFormData({...formData, primaryRelation: e.target.value})}
                                            placeholder="Ex: père, mère"
                                            required
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">
                                            Téléphone <span className="text-destructive">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.primaryPhone}
                                            onChange={(e) => setFormData({...formData, primaryPhone: e.target.value})}
                                            placeholder="06 12 34 56 78"
                                            required
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">
                                            Téléphone alternatif
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.primaryAltPhone}
                                            onChange={(e) => setFormData({...formData, primaryAltPhone: e.target.value})}
                                            placeholder="Optionnel"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact secondaire */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-px flex-1 bg-border" />
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact secondaire (optionnel)</span>
                                    <div className="h-px flex-1 bg-border" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <input
                                        type="text"
                                        value={formData.secondaryName}
                                        onChange={(e) => setFormData({...formData, secondaryName: e.target.value})}
                                        placeholder="Nom"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    />
                                    <input
                                        type="text"
                                        value={formData.secondaryRelation}
                                        onChange={(e) => setFormData({...formData, secondaryRelation: e.target.value})}
                                        placeholder="Lien"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    />
                                    <input
                                        type="tel"
                                        value={formData.secondaryPhone}
                                        onChange={(e) => setFormData({...formData, secondaryPhone: e.target.value})}
                                        placeholder="Téléphone"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    />
                                </div>
                            </div>

                            {/* Contact de secours */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <div className="h-px flex-1 bg-border" />
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contact de secours (optionnel)</span>
                                    <div className="h-px flex-1 bg-border" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <input
                                        type="text"
                                        value={formData.backupName}
                                        onChange={(e) => setFormData({...formData, backupName: e.target.value})}
                                        placeholder="Nom"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    />
                                    <input
                                        type="text"
                                        value={formData.backupRelation}
                                        onChange={(e) => setFormData({...formData, backupRelation: e.target.value})}
                                        placeholder="Lien"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    />
                                    <input
                                        type="tel"
                                        value={formData.backupPhone}
                                        onChange={(e) => setFormData({...formData, backupPhone: e.target.value})}
                                        placeholder="Téléphone"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Autorisations */}
                    <div className="rounded-lg border bg-card shadow-sm">
                        <div className="border-b bg-muted/50 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                <h2 className="text-lg font-semibold">Autorisations & validité</h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium leading-none cursor-pointer">
                                        Autorisation soins / hospitalisation
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                        En cas d'urgence médicale
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={formData.consentHospitalization}
                                    onClick={() => setFormData({...formData, consentHospitalization: !formData.consentHospitalization})}
                                    className={`inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                                        formData.consentHospitalization ? 'bg-primary' : 'bg-input'
                                    }`}
                                >
                  <span
                      className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                          formData.consentHospitalization ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                                </button>
                            </div>

                            <div className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-medium leading-none cursor-pointer">
                                        Autorisation transport
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                        Par les moyens appropriés
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={formData.consentTransport}
                                    onClick={() => setFormData({...formData, consentTransport: !formData.consentTransport})}
                                    className={`inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                                        formData.consentTransport ? 'bg-primary' : 'bg-input'
                                    }`}
                                >
                  <span
                      className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                          formData.consentTransport ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">
                                    Validité jusqu'au
                                </label>
                                <input
                                    type="date"
                                    value={formData.validUntil}
                                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Recommandé : mise à jour annuelle
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Consentement RGPD */}
                    <div className="rounded-lg border-2 bg-card p-6">
                        <div className="flex items-start gap-3">
                            <div
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border mt-0.5 cursor-pointer ${
                                    formData.rgpdConsent
                                        ? 'bg-primary border-primary'
                                        : 'border-primary'
                                }`}
                                onClick={() => setFormData({...formData, rgpdConsent: !formData.rgpdConsent})}
                            >
                                {formData.rgpdConsent && <Check className="h-4 w-4 text-primary-foreground" />}
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium leading-none cursor-pointer">
                                    Consentement RGPD <span className="text-destructive">*</span>
                                </label>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Je consens au traitement de ces données de santé conformément au RGPD. J'ai été informé(e) de mes droits d'accès, de rectification, d'effacement et de portabilité. Pour exercer ces droits, je peux contacter le délégué à la protection des données de l'établissement.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            onClick={handleSubmit}
                            disabled={!formData.rgpdConsent || isSaving}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6 flex-1"
                        >
                            {isSaving ? 'Enregistrement…' : 'Enregistrer'}
                        </button>
                        <button
                            onClick={handleReset}
                            disabled={isSaving}
                            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-6"
                        >
                            Réinitialiser
                        </button>
                    </div>

                    <div className="text-center text-sm text-muted-foreground pt-2">
                        Dernière mise à jour : jamais
                    </div>
                </div>
            </div>
        </div>
    );
}