const Modal = {
    open() {
        // abrir o modal e adicionar a class active ao modal
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')
    },
    close() {
        // fechar o modal e remover a class active do modal
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
    }

}