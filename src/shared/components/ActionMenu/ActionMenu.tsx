import { DeleteOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons"
import { FloatButton } from "antd"
import { useState } from "react";
import { DeleteModal } from "../DeleteModal/DeleteModal";
import { useEditMode } from "../../../contexts/EditMode/hooks/useEditMode";

export const ActionMenu = () => {
    const [deleteModal, setDeleteModal] = useState(false);

    const editModeContext = useEditMode();

    const handleDelete = () => {
        setDeleteModal(false);
        editModeContext.disableEditMode();
    }

    return (
        <>
            <DeleteModal isOpen={deleteModal} onClose={handleDelete} />
			<FloatButton.Group shape="square">
                {!editModeContext.isEditMode && <FloatButton
					icon={<EditOutlined />}
                    onClick={editModeContext.enableEditMode}
					tooltip={{
						title: 'Редактировать',
						color: 'blue',
						placement: 'left',
					}} />}
                {
                    editModeContext.isEditMode && <FloatButton
                    icon={<SaveOutlined />}
                    onClick={editModeContext.disableEditMode}
                    tooltip={{
                        title: 'Сохранить',
                        color: 'blue',
                        placement: 'left',
                    }}/>
                }
				<FloatButton
					icon={<DeleteOutlined />}
                    onClick={() => setDeleteModal(true)}
					tooltip={{
						title: 'Удалить',
						color: 'blue',
						placement: 'left',
					}}
				/>
			</FloatButton.Group>
        </>
    )
}