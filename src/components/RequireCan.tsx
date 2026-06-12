import {useCan} from "@refinedev/core";
import {Navigate} from "react-router-dom";
import React from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";

type RequireCanProps = {
    resource: string;
    action: string;
    children: React.ReactNode;
};

/** Garde de route générique : évalue les RULES RBAC et redirige vers /403 en cas de refus. */
const RequireCan: React.FC<RequireCanProps> = ({ resource, action, children }) => {
    const { data, isLoading } = useCan({ resource, action });

    if (isLoading) {
        return (<LoadingSpinner />);
    }

    if (!data?.can) {
        return <Navigate to="/403" replace />;
    }

    return <>{children}</>;
};

export default RequireCan;
