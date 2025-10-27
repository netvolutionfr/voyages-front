import './App.css'
import {Navigate, Route, Routes} from "react-router-dom";
import {Authenticated, Refine} from "@refinedev/core";
import {authProvider} from "@/auth/authProvider.ts";
import routerProvider from "@refinedev/react-router";
import {accessControlProvider} from "@/auth/accessControlProvider.ts";
import DashboardLayout from "@/components/layout/DashboardLayout.tsx";
import ProfilLayout from "@/pages/profil/ProfilLayout.tsx";
import HomePage from "@/pages/HomePage.tsx";
import Voyages from "@/pages/voyages/Voyages.tsx";
import Documents from './pages/Documents';
import {resources} from "@/config/resources.ts";
import Error403 from "@/pages/error/403.tsx";
import Error404 from "@/pages/error/404.tsx";
import RequireAdmin from "@/components/RequireAdmin.tsx";
import FicheRenseignements from "@/pages/profil/FicheRenseignements.tsx";
import FicheParents from "@/pages/profil/FicheParents.tsx";
import {voyagesDataProvider} from "@/providers/dataProvider.ts";
import ParticipantsAdmin from "@/pages/admin/participants/ParticipantsAdmin.tsx";
import SectionsAdmin from "@/pages/admin/sections/SectionsAdmin.tsx";
import SectionsForm from "@/pages/admin/sections/SectionsForm.tsx";
import Participants from "@/pages/participants/Participants.tsx";
import ParticipantView from "@/pages/participants/ParticipantView.tsx";
import ParticipantsForm from "@/pages/participants/ParticipantsForm.tsx";
import UsersAdmin from "@/pages/admin/users/UsersAdmin.tsx";
import VoyagesForm from "@/pages/voyages/VoyagesForm.tsx";
import {publicDataProvider} from "@/providers/publicDataProvider.ts";
import ImportCsvPage from "@/pages/admin/ImportCsvPage.tsx";

import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import OtpPage from "@/pages/OtpPage.tsx";
import VoyageDetail from "@/pages/voyages/VoyageDetail.tsx";
import StudentHealthForm from "@/pages/profil/StudentHealthForm.tsx";


export default function App() {
    return (
        <Refine
            routerProvider={routerProvider}
            dataProvider={{
                default: voyagesDataProvider,
                public: publicDataProvider,
            }}
            authProvider={authProvider}
            accessControlProvider={accessControlProvider}
            resources={resources}
        >
            <Routes>
                {/* Routes publiques */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Route OTP, restreinte par un JWT temporaire */}
                <Route path="/otp" element={
                    <Authenticated
                        key={location.pathname}
                        fallback={<Navigate to="/login" replace />}
                    >
                        <OtpPage />
                    </Authenticated>
                } />

                {/* Routes protégées */}
                <Route
                    element={
                        <Authenticated key={location.pathname}>
                            <DashboardLayout />
                        </Authenticated>
                    }
                >
                    <Route path="/" element={<HomePage />} />
                    <Route path="/sanitaire" element={<StudentHealthForm />} />
                    <Route path="/profil" element={<ProfilLayout />}>
                        <Route index element={<FicheRenseignements />} />
                        <Route path="parents" element={<FicheParents />} />
                    </Route>

                    <Route path="/voyages" element={<Voyages />} />
                    <Route path="/voyages/create" element={<VoyagesForm />} />
                    <Route path="/voyages/edit/:id" element={<VoyagesForm />} />
                    <Route path="/voyages/:id" element={<VoyageDetail />} />

                    <Route path="/documents" element={<Documents />} />

                    <Route path="/participants" element={<Participants />} />
                    <Route path="/participants/:id" element={<ParticipantView />} />
                    <Route path="/participants/create" element={<ParticipantsForm />} />
                    <Route path="/participants/edit/:id" element={<ParticipantsForm />} />

                    <Route
                        path="/admin/participants"
                        element={
                            <RequireAdmin>
                                <ParticipantsAdmin />
                            </RequireAdmin>
                        }
                    />
                    <Route
                        path="/admin/sections"
                        element={
                            <RequireAdmin>
                                <SectionsAdmin />
                            </RequireAdmin>
                        }
                    />
                    <Route
                        path="/admin/sections/create"
                        element={
                            <RequireAdmin>
                                <SectionsForm />
                            </RequireAdmin>
                        }
                    />
                    <Route
                        path="/admin/sections/edit/:id"
                        element={
                            <RequireAdmin>
                                <SectionsForm />
                            </RequireAdmin>
                        }
                    />
                    <Route
                        path="/admin/users"
                        element={
                            <RequireAdmin>
                                <UsersAdmin />
                            </RequireAdmin>
                        }
                    />
                    <Route
                        path="/admin/users/import"
                        element={
                            <RequireAdmin>
                                <ImportCsvPage />
                            </RequireAdmin>
                        }
                    />
                </Route>

                <Route path="/403" element={<Error403 />} />
                <Route path="*" element={<Error404 />} />
            </Routes>
        </Refine>
    );
}
