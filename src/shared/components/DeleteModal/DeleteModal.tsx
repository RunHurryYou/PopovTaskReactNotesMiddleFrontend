import { Modal } from "antd"

export const DeleteModal = ({isOpen, onClose}: {isOpen: boolean, onClose: () => void}) => {
    return (
        <Modal
            title="Удаление заметки"
            open={isOpen}
            centered
            onOk={onClose}
            onCancel={onClose}
        >
            Вы уверены что хотите удалить заметку?
        </Modal>
    )
}