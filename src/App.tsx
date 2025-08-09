import './App.css'
import {Route, Routes} from "react-router-dom";
import {Authenticated, Refine} from "@refinedev/core";
import {authProvider} from "@/providers/authProvider.ts";
import routerProvider from "@refinedev/react-router";
import {accessControlProvider} from "@/providers/accessControlProvider.ts";
import DashboardLayout from "@/components/layout/DashboardLayout.tsx";
import ProfilLayout from "@/pages/profil/ProfilLayout.tsx";
import HomePage from "@/pages/HomePage.tsx";
import Voyages from "@/pages/Voyages.tsx";
import Documents from './pages/Documents';
import {resources} from "@/config/resources.ts";
import Error403 from "@/pages/error/403.tsx";
import Error404 from "@/pages/error/404.tsx";
import RequireAdmin from "@/components/RequireAdmin.tsx";
import FicheRenseignements from "@/pages/profil/FicheRenseignements.tsx";
import FicheSanitaire from "@/pages/profil/FicheSanitaire.tsx";
import FicheParents from "@/pages/profil/FicheParents.tsx";
import {voyagesDataProvider} from "@/providers/dataProvider.ts";
import VoyagesAdmin from "@/pages/admin/voyages/VoyagesAdmin.tsx";
import ParticipantsAdmin from "@/pages/admin/participants/ParticipantsAdmin.tsx";
import SectionsAdmin from "@/pages/admin/sections/SectionsAdmin.tsx";
import SectionsForm from "@/pages/admin/sections/SectionsForm.tsx";

function App() {
    return (
            <Refine
                routerProvider={routerProvider}
                dataProvider={voyagesDataProvider}
                authProvider={authProvider}
                accessControlProvider={accessControlProvider}
                resources={resources}
            >
                <Routes>
                    <Route element={
                        <Authenticated key={location.pathname}>
                            <DashboardLayout />
                        </Authenticated>}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/profil" element={<ProfilLayout />}>
                            <Route index element={<FicheRenseignements />} />
                            <Route path="sanitaire" element={<FicheSanitaire />} />
                            <Route path="parents" element={<FicheParents />} />
                        </Route>
                        <Route path="/voyages" element={<Voyages />} />
                        <Route path="/documents" element={<Documents />} />
                        <Route path="/admin/voyages" element={
                                <RequireAdmin>
                                    <VoyagesAdmin />
                                </RequireAdmin>} />
                        <Route path="/admin/participants" element={
                                <RequireAdmin>
                                    <ParticipantsAdmin />
                                </RequireAdmin>} />
                        <Route path="/admin/sections" element={
                                <RequireAdmin>
                                    <SectionsAdmin />
                                </RequireAdmin>} />
                        <Route path="/admin/sections/create" element={
                                <RequireAdmin>
                                    <SectionsForm />
                                </RequireAdmin>} />
                        <Route path="/admin/sections/edit/:id" element={
                                <RequireAdmin>
                                    <SectionsForm />
                                </RequireAdmin>} />
                    </Route>
                    <Route path="/403" element={<Error403 />} />
                    <Route path="*" element={<Error404 />} />
                </Routes>
            </Refine>
    );
}
export default App;
