import {useState} from "react";
import {useCreate} from "@refinedev/core";
import {Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {IconAlertCircle} from "@tabler/icons-react";

type LineError = { line: number; error: string };
type ImportResult = { imported: number; skipped: number; errors: LineError[] };

const MAX_SIZE_MB = 5;
const PREVIEW_ROWS = 5;
const ACCEPTED_TYPES = ["text/csv", "application/vnd.ms-excel", "text/plain", ""];

const EXPECTED_HEADERS = [
    "role", "lastName", "firstName", "email", "telephone", "gender", "section", "birthDate",
    "parent1_lastName", "parent1_firstName", "parent1_email", "parent1_tel",
    "parent2_lastName", "parent2_firstName", "parent2_email", "parent2_tel",
];

type CsvPreview = {
    headers: string[];
    rows: string[][];
    totalDataLines: number;
};

/** Nettoie une cellule pour l'aperçu : guillemets d'encadrement et caractères de contrôle */
function sanitizeCell(cell: string): string {
    return cell
        .trim()
        .replace(/^"(.*)"$/s, "$1")
        // eslint-disable-next-line no-control-regex
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");
}

/** Parsing léger (séparateur , ou ; détecté sur l'en-tête) — suffisant pour
 *  valider les en-têtes et prévisualiser ; le parsing faisant foi reste côté backend. */
function parseCsvHead(text: string): CsvPreview {
    const lines = text.split(/\r\n|\r|\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [], totalDataLines: 0 };

    const headerLine = lines[0];
    const delimiter = (headerLine.match(/;/g)?.length ?? 0) > (headerLine.match(/,/g)?.length ?? 0) ? ";" : ",";
    const split = (line: string) => line.split(delimiter).map(sanitizeCell);

    return {
        headers: split(headerLine),
        rows: lines.slice(1, 1 + PREVIEW_ROWS).map(split),
        totalDataLines: lines.length - 1,
    };
}

export default function ImportCsvPage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<CsvPreview | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const { mutate, mutation } = useCreate<ImportResult>({
        resource: "admin/import",               // → POST /api/admin/import
    });
    const isPending = mutation.isPending;
    const isSuccess = mutation.isSuccess;
    const data = mutation.data;

    const onFileChange = async (f: File | null) => {
        setFile(null);
        setPreview(null);
        setFileError(null);
        if (!f) return;

        if (!f.name.toLowerCase().endsWith(".csv")) {
            setFileError("Le fichier doit porter l'extension .csv.");
            return;
        }
        if (!ACCEPTED_TYPES.includes(f.type)) {
            setFileError(`Type de fichier non accepté (${f.type || "inconnu"}). Un CSV texte est attendu.`);
            return;
        }
        if (f.size > MAX_SIZE_MB * 1024 * 1024) {
            setFileError(`Fichier trop volumineux (max ${MAX_SIZE_MB} Mo).`);
            return;
        }

        let parsed: CsvPreview;
        try {
            parsed = parseCsvHead(await f.text());
        } catch {
            setFileError("Impossible de lire le fichier comme du texte CSV.");
            return;
        }

        const missing = EXPECTED_HEADERS.filter((h) => !parsed.headers.includes(h));
        if (missing.length > 0) {
            setFileError(`En-têtes manquants : ${missing.join(", ")}`);
            setPreview(parsed);
            return;
        }
        if (parsed.totalDataLines === 0) {
            setFileError("Le fichier ne contient aucune ligne de données.");
            return;
        }

        setFile(f);
        setPreview(parsed);
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || fileError) return;

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
                                onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
                            />
                            <p className="text-sm text-muted-foreground mt-2">
                                En-têtes attendus : {EXPECTED_HEADERS.join(", ")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Taille maximale : {MAX_SIZE_MB} Mo.
                            </p>
                        </div>

                        {fileError && (
                            <Alert variant="destructive">
                                <IconAlertCircle className="h-4 w-4" />
                                <AlertTitle>Fichier refusé</AlertTitle>
                                <AlertDescription>{fileError}</AlertDescription>
                            </Alert>
                        )}

                        {preview && !fileError && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">
                                    Aperçu ({Math.min(PREVIEW_ROWS, preview.totalDataLines)} ligne(s) sur {preview.totalDataLines})
                                </p>
                                <div className="overflow-x-auto rounded-md border">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="bg-muted/50">
                                                {preview.headers.map((h, i) => (
                                                    <th key={i} className="px-2 py-1 text-left font-medium whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {preview.rows.map((row, ri) => (
                                                <tr key={ri} className="border-t">
                                                    {preview.headers.map((_, ci) => (
                                                        <td key={ci} className="px-2 py-1 whitespace-nowrap">{row[ci] ?? ""}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        <Button type="submit" disabled={!file || !!fileError || isPending}>
                            {isPending ? "Import en cours..." : "Importer"}
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
