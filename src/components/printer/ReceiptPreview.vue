<template>
  <div class="receipt-preview-container">
    <!-- Header -->
    <div class="preview-header">
      <h3 class="preview-title">{{ t('print.preview.title') }}</h3>
      <button @click="closePreview" class="btn-close">
        <span class="material-icons-outlined">close</span>
      </button>
    </div>

    <!-- Receipt Preview -->
    <div class="receipt-container">
      <div class="receipt-paper" ref="receiptElement">
        <!-- Company Header -->
        <div class="receipt-header">
          <h2 class="company-name">POS SYSTEM</h2>
          <div class="company-details">
            <p>123 Plaza Avenue</p>
            <p>Houston, Texas 77470</p>
            <p>(956) 456-7890</p>
          </div>
        </div>

        <!-- Receipt Information -->
        <div class="receipt-info">
          <div class="receipt-title">RECEIPT</div>
          <div class="receipt-data">
            <p><strong>Receipt #:</strong> {{ receiptData.receipt_number }}</p>
            <p><strong>Date:</strong> {{ receiptData.date }}</p>
            <p><strong>Time:</strong> {{ receiptData.time }}</p>
            <p><strong>Cashier:</strong> {{ receiptData.cashier }}</p>
            <p v-if="receiptData.customer"><strong>Customer:</strong> {{ receiptData.customer }}</p>
          </div>
        </div>

        <!-- Items List -->
        <div class="receipt-items">
          <div class="items-header">
            <span class="item-name">Item</span>
            <span class="item-qty">Qty</span>
            <span class="item-price">Price</span>
            <span class="item-total">Total</span>
          </div>

          <div class="items-list">
            <div v-for="item in receiptData.items" :key="item.name" class="item-row">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-qty">{{ item.quantity }}</span>
              <span class="item-price">${{ item.unit_price.toFixed(2) }}</span>
              <span class="item-total">${{ item.total.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Totals -->
        <div class="receipt-totals">
          <div class="total-line">
            <span>Subtotal:</span>
            <span>${{ receiptData.subtotal.toFixed(2) }}</span>
          </div>
          
          <div v-if="receiptData.discount_total > 0" class="total-line">
            <span>Discount:</span>
            <span>-${{ receiptData.discount_total.toFixed(2) }}</span>
          </div>
          
          <div class="total-line">
            <span>Tax:</span>
            <span>${{ receiptData.tax_total.toFixed(2) }}</span>
          </div>
          
          <div class="total-divider"></div>
          
          <div class="total-line total-final">
            <span>TOTAL:</span>
            <span>${{ receiptData.total.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Payment Information -->
        <div class="receipt-payment">
          <p><strong>Payment Method:</strong> {{ receiptData.payment_method.toUpperCase() }}</p>
          
          <div v-if="receiptData.payment_method === 'cash' && receiptData.cash_received > 0">
            <p><strong>Cash Received:</strong> ${{ receiptData.cash_received.toFixed(2) }}</p>
            <p><strong>Change Given:</strong> ${{ receiptData.change_given.toFixed(2) }}</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="receipt-footer">
          <p>Thank you for your business!</p>
          <p>Visit us again soon!</p>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="preview-actions">
      <button @click="printReceipt" class="btn btn-primary">
        <span class="material-icons-outlined">print</span>
        {{ t('print.preview.print') }}
      </button>

      <button @click="saveAsPDF" class="btn btn-secondary">
        <span class="material-icons-outlined">picture_as_pdf</span>
        {{ t('print.preview.save_pdf') }}
      </button>

      <button @click="emailReceipt" class="btn btn-info">
        <span class="material-icons-outlined">email</span>
        {{ t('print.preview.email') }}
      </button>

      <button @click="copyReceipt" class="btn btn-outline">
        <span class="material-icons-outlined">content_copy</span>
        {{ t('print.preview.copy') }}
      </button>
    </div>

    <!-- Email Modal -->
    <div v-if="showEmailModal" class="modal-overlay" @click="closeEmailModal">
      <div class="modal-content" @click.stop>
        <h4>{{ t('print.preview.email.title') }}</h4>
        
        <div class="form-group">
          <label>{{ t('print.preview.email.recipient') }}</label>
          <input 
            type="email" 
            v-model="emailAddress" 
            class="form-input"
            :placeholder="t('print.preview.email.placeholder')"
          />
        </div>

        <div class="form-group">
          <label>{{ t('print.preview.email.subject') }}</label>
          <input 
            type="text" 
            v-model="emailSubject" 
            class="form-input"
            :placeholder="t('print.preview.email.subject_placeholder')"
          />
        </div>

        <div class="modal-actions">
          <button @click="sendReceiptEmail" class="btn btn-primary">
            {{ t('print.preview.email.send') }}
          </button>
          <button @click="closeEmailModal" class="btn btn-secondary">
            {{ t('print.preview.email.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Receipt, createReceiptFromSale } from '@/utils/receiptUtils'

const { t } = useI18n()

// Props
const props = defineProps({
  saleData: {
    type: Object,
    required: true
  },
  customer: {
    type: Object,
    default: null
  },
  cashier: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['close'])

// State
const receiptElement = ref(null)
const showEmailModal = ref(false)
const emailAddress = ref('')
const emailSubject = ref('')
const receiptData = ref({
  receipt_number: 'REC-' + Date.now(),
  date: new Date().toLocaleDateString(),
  time: new Date().toLocaleTimeString(),
  cashier: 'Unknown',
  customer: '',
  items: [],
  subtotal: 0,
  discount_total: 0,
  tax_total: 0,
  total: 0,
  payment_method: 'cash',
  cash_received: 0,
  change_given: 0
})

// Methods
const generateReceipt = () => {
  const receipt = createReceiptFromSale(props.saleData, props.customer, props.cashier)
  
  receiptData.value = {
    receipt_number: receipt.receipt_number,
    date: receipt.date.toLocaleDateString(),
    time: receipt.date.toLocaleTimeString(),
    cashier: receipt.cashier?.name || 'Unknown',
    customer: receipt.customer?.name || '',
    items: receipt.items,
    subtotal: receipt.subtotal,
    discount_total: receipt.discount_total,
    tax_total: receipt.tax_total,
    total: receipt.total,
    payment_method: receipt.payment_method,
    cash_received: receipt.cash_received,
    change_given: receipt.change_given
  }
}

const printReceipt = async () => {
  try {
    const receipt = createReceiptFromSale(props.saleData, props.customer, props.cashier)
    const receiptText = receipt.generateTextReceipt()
    
    const result = await window.electronAPI.print.printReceipt(receiptText)
    
    if (result.success) {
      alert(t('print.preview.print_success'))
    } else {
      alert(t('print.preview.print_error') + ': ' + result.message)
    }
  } catch (error) {
    console.error('Print error:', error)
    alert(t('print.preview.print_error'))
  }
}

const saveAsPDF = async () => {
  try {
    const receipt = createReceiptFromSale(props.saleData, props.customer, props.cashier)
    const result = await window.electronAPI.files.saveFile(
      '', // Will be generated by receipt
      `receipt_${receipt.receipt_number}.pdf`,
      'pdf'
    )
    
    if (result.success) {
      alert(t('print.preview.save_success'))
    } else {
      alert(t('print.preview.save_error'))
    }
  } catch (error) {
    console.error('Save error:', error)
    alert(t('print.preview.save_error'))
  }
}

const emailReceipt = () => {
  emailAddress.value = props.customer?.email || ''
  emailSubject.value = `${t('print.preview.email.default_subject')} ${receiptData.value.receipt_number}`
  showEmailModal.value = true
}

const sendReceiptEmail = async () => {
  if (!emailAddress.value) {
    alert(t('print.preview.email.no_address'))
    return
  }

  try {
    const receipt = createReceiptFromSale(props.saleData, props.customer, props.cashier)
    const result = await window.electronAPI.email?.sendReceipt?.({
      to: emailAddress.value,
      subject: emailSubject.value || `${t('print.preview.email.default_subject')} ${receipt.receipt_number}`,
      receiptNumber: receipt.receipt_number,
      pdfData: null // Will generate PDF in backend
    })

    if (result?.success) {
      alert(t('print.preview.email.send_success'))
      closeEmailModal()
    } else {
      alert(t('print.preview.email.send_error'))
    }
  } catch (error) {
    console.error('Email error:', error)
    alert(t('print.preview.email.send_error'))
  }
}

const copyReceipt = () => {
  const receipt = createReceiptFromSale(props.saleData, props.customer, props.cashier)
  const receiptText = receipt.generateTextReceipt()
  
  navigator.clipboard.writeText(receiptText).then(() => {
    alert(t('print.preview.copy_success'))
  }).catch(() => {
    alert(t('print.preview.copy_error'))
  })
}

const closePreview = () => {
  emit('close')
}

const closeEmailModal = () => {
  showEmailModal.value = false
  emailAddress.value = ''
  emailSubject.value = ''
}

// Lifecycle
onMounted(() => {
  generateReceipt()
})
</script>

<style scoped>
.receipt-preview-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  border-bottom: 1px solid #e1e8ed;
}

.preview-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #2c3e50;
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.btn-close:hover {
  background: #f8f9fa;
}

.receipt-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  justify-content: center;
}

.receipt-paper {
  width: 300px;
  background: white;
  border: 1px solid #ddd;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.3;
  padding: 20px;
}

.receipt-header {
  text-align: center;
  margin-bottom: 20px;
}

.company-name {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.company-details p {
  margin: 2px 0;
  color: #7f8c8d;
}

.receipt-title {
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  margin: 15px 0;
  text-transform: uppercase;
}

.receipt-data p {
  margin: 3px 0;
}

.receipt-items {
  margin: 20px 0;
}

.items-header {
  display: flex;
  font-weight: bold;
  padding-bottom: 5px;
  border-bottom: 1px dashed #ccc;
  margin-bottom: 10px;
}

.item-row {
  display: flex;
  margin-bottom: 5px;
}

.item-name {
  flex: 2;
  text-align: left;
}

.item-qty {
  flex: 0.5;
  text-align: center;
}

.item-price {
  flex: 0.8;
  text-align: right;
}

.item-total {
  flex: 0.8;
  text-align: right;
}

.receipt-totals {
  margin-top: 20px;
}

.total-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3px;
}

.total-divider {
  border-top: 1px dashed #ccc;
  margin: 5px 0;
}

.total-final {
  font-weight: bold;
  font-size: 16px;
}

.receipt-payment {
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px dashed #ccc;
}

.receipt-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 12px;
  color: #7f8c8d;
}

.preview-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  padding: 20px;
  background: #f8f9fa;
  border-top: 1px solid #e1e8ed;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-outline {
  background: white;
  color: #3498db;
  border: 1px solid #3498db;
}

.btn:hover {
  opacity: 0.9;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 400px;
  max-width: 500px;
}

.modal-content h4 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #34495e;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

@media print {
  .receipt-preview-container {
    position: static;
    background: none;
  }
  
  .preview-header,
  .preview-actions {
    display: none;
  }
  
  .receipt-container {
    overflow: visible;
  }
}
</style>
