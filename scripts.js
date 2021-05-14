const Modal = {
    toggleClass() {
        // abrir e fechar o modal e adicionar a class active ao modal. em outro tipo de caso, podem ser adicionados no lugar a classList toggle, as classLists .add e .remove, atreladas respectivamente aos métodos open e close.
        document
            .querySelector('.modal-overlay')
            .classList
            .toggle('active')
    }
}

/* eu preciso somar as entradas, depois eu preciso somar as saídas e remover das entradas o valor das saídas, assim eu terei o valor total */

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions)) /* o objeto JSON.stringify converte em string */
    }
}

const Transaction = {
    all: Storage.get(),
    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },
    remove(index) {
        Transaction.all.splice(index, 1)
        App.reload()
    },
    incomes(){
        /* capturar as transaçoes, para cada uma, verificar se é > 0, se for, somar a uma variavel e retorna-la */
        let income = 0;
        Transaction.all.forEach(transaction => { /* => {} arrowfunction, outro modo de declarar a função */
            if(transaction.amount > 0) {
                income += transaction.amount;
            }
        }) 
        return income
    },
    expenses(){
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0) {
                expense += transaction.amount;
            }
        }) 
        return expense
    },
    total(){
        return Transaction.incomes() + Transaction.expenses()
    }
}

/* substituir os dados do html com os dados do js */

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)
            
        const html = `
            <tr>
                <td class="description">${transaction.description}</td>
                <td class="${CSSclass}">${amount}</td>
                <td class="date">${transaction.date}</td>
                <td>
                    <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
                </td>
            </tr>        
        `
        return html
    },
    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    },
}

const Utils = {
    formatAmount(value) {
        value = Number(value.replace(/\,\./g, "")) * 100
        return value
    },
    formatDate(date) {
        const splittedDate = date.split("-") /* split é separar, aplicamos uma string para separar a data pelos traços (2021-05-14) e os converte para um array */
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "" /* estamos pegando o sinal negativo, transformando em string  e salvando na const signal*/

        value = String(value).replace(/\D/g, "") /* o /\D/ pega todos os caracteres que são string e substitui, no caso estamos pegando o sinal - e substituindo por vazio; o 'g' é para definir que a ação é global, caso contrário, o comando pegaria apenas o primeiro caractere encontrado na string e não toda ela */

        value = Number(value) / 100 /* estamos dividindo o número por 100, pois no caso, o usuário cadastra os centavos, então, 100,01 é cadastrado como 10001 */

        value = value.toLocaleString("pt-BR", { /* toLocaleString é uma funcionalidade do JS que permite a formatação de um elemento de acordo coma localização, no caso estamos definindo "pt-BR" */
            style: "currency", /* após, abrimos um objeto para definir o estilo 'currency' (moeda) */
            currency: "BRL" /* após, definimos a currency (moeda) em BRL (real brasileiro) */
        })

        return signal + value   
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    getValues () {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },
    validateFields() {
        const {description, amount, date} = Form.getValues()
        if( description.trim() === "" || /* o trim faz uma limpeza dos espaços vazios da sua string */
            amount.trim() === "" || /* se o description, o amount ou o date estiverem vazios, ele entra no if */
            date.trim() === "") {
                throw new Error("Por favor, preencha todos os campos!") /* criando um objeto de erro */
            }
    },
    formatValues() {
        let {description, amount, date} = Form.getValues()
        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },
    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    submit(event) {
        event.preventDefault()
        
        try {
            Form.validateFields() /* verificar se tudo foi preenchido */
            const transaction = Form.formatValues() /* formatar os dados para salvar */
            Transaction.add(transaction) /* salvar */
            Form.clearFields() /* apagar os dados do formulário */
            Modal.toggleClass() /* modal feche */
        } catch (error) {
            alert(error.message)
        }


    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)
        DOM.updateBalance()
        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()