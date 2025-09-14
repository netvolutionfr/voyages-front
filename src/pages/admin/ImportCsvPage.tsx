import {useState} from "react";
import {useCreate} from "@refinedev/core";
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

type LineError = { line: number; error: string };
type ImportResult = { imported: number; skipped: number; errors: LineError[] };

export default function ImportCsvPage() {
    const [file, setFile] = useState<File | null>(null);

    const { mutate, isLoading, isSuccess, data } = useCreate<ImportResult>({
        resource: "admin/import",               // → POST /api/admin/import
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        const form = new FormData();
        form.append("file", file);

        mutate({ values: form });
    };

    return (
        <div className="p-6 flex justify-center">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Import CSV — Utilisateurs & Participants</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <Input
                                type="file"
                                accept=".csv,text/csv"
                                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                            />
                            <p className="text-sm text-muted-foreground mt-2">
                                En-têtes attendus : role, nom, prenom, email, telephone, sexe, section, dateNaissance, parent1_nom, parent1_prenom, parent1_email, parent1_tel, parent2_nom, parent2_prenom, parent2_email, parent2_tel
                            </p>
                        </div>
                        <Button type="submit" disabled={!file || isLoading}>
                            {isLoading ? "Import en cours..." : "Importer"}
                        </Button>
                    </form>

                    {isSuccess && data?.data && (
                        <div className="mt-6 space-y-2">
                            <div><strong>Importés :</strong> {data.data.imported}</div>
                            <div><strong>Ignorés :</strong> {data.data.skipped}</div>
                            {data.data.errors?.length > 0 && (
                                <div className="mt-2">
                                    <strong>Erreurs :</strong>
                                    <ul className="list-disc ml-6">
                                        {data.data.errors.map((e, i) => (
                                            <li key={i}>Ligne {e.line}: {e.error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
