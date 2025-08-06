import { Link } from "@refinedev/core";

const Error403 = () => {
    return (
        <div className="flex items-center min-h-screen px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16">
            <div className="w-full space-y-6 text-center">
                <div className="space-y-3">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">403 Forbidden</h1>
                    <p className="text-gray-500">Vous n'avez pas les droits nécessaires pour accéder à cette page.</p>
                </div>
                <Link
                    to="/"
                    className="inline-flex h-10 items-center rounded-md border border-gray-200 border-gray-200 bg-white shadow-sm px-8 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus-visible:ring-gray-300"
                    prefetch={false}
                >
                    Retourner à l'accueil
                </Link>
            </div>
        </div>
    )
}

export default Error403;
