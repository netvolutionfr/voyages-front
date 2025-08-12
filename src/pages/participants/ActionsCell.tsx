import { Button } from "@/components/ui/button.tsx";
import { EditIcon } from "lucide-react";
import {Link} from "react-router-dom";
import type {IParticipant} from "@/pages/participants/IParticipant.ts";

function ActionsCell({item}: { item: IParticipant }) {

    return (
        <div className="flex gap-2">
            <Button variant="outline" asChild>
                <Link to={`/participants/edit/${item.id}`}>
                    <EditIcon/>
                </Link>
            </Button>
        </div>
    )
}
export default ActionsCell;
