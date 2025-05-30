document.addEventListener('DOMContentLoaded', () => {
    // Carregar configurações salvas
    const salary = localStorage.getItem('app2_salary') || 0;
    const paymentDay = localStorage.getItem('app2_paymentDay') || 1;
    const transactions = JSON.parse(localStorage.getItem('app2_transactions')) || [];
    const selectedMonth = localStorage.getItem('app2_selectedMonth') || new Date().getMonth() + 1;

    // Preencher o select de dia de pagamento
    const paymentDaySelect = document.getElementById('payment-day');
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        paymentDaySelect.appendChild(option);
    }
    paymentDaySelect.value = paymentDay;

    // Preencher o select de mês
    document.getElementById('month').value = selectedMonth;

    // Atualizar interface
    updateSummary();
    renderTransactions();

    // Event listeners
    document.getElementById('theme').addEventListener('change', toggleTheme);
    document.getElementById('month').addEventListener('change', () => {
        localStorage.setItem('app2_selectedMonth', document.getElementById('month').value);
        renderTransactions();
    });
    paymentDaySelect.addEventListener('change', () => {
        localStorage.setItem('app2_paymentDay', paymentDaySelect.value);
        updateSummary();
    });
});

// Definir salário
function setSalary() {
    const salaryInput = document.getElementById('salary');
    const salary = parseFloat(salaryInput.value);
    if (!isNaN(salary) && salary >= 0) {
        localStorage.setItem('app2_salary', salary);
        updateSummary();
        salaryInput.value = '';
    } else {
        alert('Por favor, insira um salário válido.');
    }
}

// Adicionar transação
function addTransaction() {
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;
    const type = document.querySelector('input[name="type"]:checked').value;
    const recurring = document.getElementById('recurring').checked;

    if (description && !isNaN(amount) && date) {
        const transactions = JSON.parse(localStorage.getItem('app2_transactions')) || [];
        transactions.push({ description, amount, date, type, recurring });
        localStorage.setItem('app2_transactions', JSON.stringify(transactions));
        renderTransactions();
        updateSummary();
        clearInputs();
    } else {
        alert('Por favor, preencha todos os campos corretamente.');
    }
}

// Limpar inputs
function clearInputs() {
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('date').value = '';
    document.getElementById('recurring').checked = false;
    document.querySelector('input[name="type"][value="expense"]').checked = true;
}

// Renderizar transações
function renderTransactions() {
    const transactions = JSON.parse(localStorage.getItem('app2_transactions')) || [];
    const selectedMonth = parseInt(document.getElementById('month').value);
    const transactionList = document.getElementById('transaction-list');
    transactionList.innerHTML = '';

    transactions
        .filter(t => new Date(t.date).getMonth() + 1 === selectedMonth)
        .forEach((t, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${t.description}</td>
                <td>R$ ${t.amount.toFixed(2)}</td>
                <td>${t.date}</td>
                <td><button onclick="deleteTransaction(${index})">Excluir</button></td>
            `;
            transactionList.appendChild(row);
        });
}

// Excluir transação
function deleteTransaction(index) {
    const transactions = JSON.parse(localStorage.getItem('app2_transactions')) || [];
    transactions.splice(index, 1);
    localStorage.setItem('app2_transactions', JSON.stringify(transactions));
    renderTransactions();
    updateSummary();
}

// Atualizar resumo
function updateSummary() {
    const salary = parseFloat(localStorage.getItem('app2_salary')) || 0;
    const transactions = JSON.parse(localStorage.getItem('app2_transactions')) || [];
    const selectedMonth = parseInt(document.getElementById('month').value);
    const paymentDay = parseInt(localStorage.getItem('app2_paymentDay')) || 1;

    const expenses = transactions
        .filter(t => t.type === 'expense' && new Date(t.date).getMonth() + 1 === selectedMonth)
        .reduce((sum, t) => sum + t.amount, 0);

    const income = transactions
        .filter(t => t.type === 'income' && new Date(t.date).getMonth() + 1 === selectedMonth)
        .reduce((sum, t) => sum + t.amount, 0);

    const toPay = transactions
        .filter(t => t.type === 'expense' && new Date(t.date).getMonth() + 1 === selectedMonth && new Date(t.date).getDate() >= paymentDay)
        .reduce((sum, t) => sum + t.amount, 0);

    document.getElementById('total-expenses').textContent = expenses.toFixed(2);
    document.getElementById('remaining').textContent = (salary + income - expenses).toFixed(2);
    document.getElementById('to-pay').textContent = toPay.toFixed(2);
}

// Alternar tema
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('app2_theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}