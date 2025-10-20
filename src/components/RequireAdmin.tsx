import {useCan} from "@refinedev/core";
import {Navigate} from "react-router-dom";
import React from "react";
import LoadingSpinner from "@/components/common/LoadingSpinner.tsx";

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data, isLoading } = useCan({
        resource: "admin",
        action: "show",
    });

    if (isLoading) {
        return (<LoadingSpinner />);
    }

    if (!data?.can) {
        return <Navigate to="/403" replace />;
    }

    return (
        <>
            {children}
        </>
    );
};

export default RequireAdmin;
