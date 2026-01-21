import { SideBar } from "../../shared/components/SideBar/SideBar";
import { Workspace } from "../../shared/components/Workspace/Workspace";

export const NotePage = () => {

    return (
        <div className="note-page">
            <div style={{ display: 'flex' }}>
                <SideBar />
                <Workspace />
            </div>
        </div>
    );
};