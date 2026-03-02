// ===== CONFIG =====
// Replace with your deployed Google Apps Script URL after setup
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxzOO3irpaBVvFkqGmWjcxcEUrWtyI5rb0NcSgjDpvrVmscGRqRhgpZtTJpAMnPFx4/exec';

// ===== STATE =====
let currentStep = 1;
const TOTAL_STEPS = 4;

// ===== NAVIGATION =====
function goStep(targetStep) {
  if (targetStep > currentStep && !validateStep(currentStep)) return;

  document.getElementById(`step${currentStep}`).classList.add('hidden');
  currentStep = targetStep;
  document.getElementById(`step${currentStep}`).classList.remove('hidden');
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress() {
  document.querySelectorAll('.progress-step').forEach(el => {
    const step = parseInt(el.dataset.step);
    el.classList.remove('active', 'completed');
    if (step === currentStep) el.classList.add('active');
    if (step < currentStep) el.classList.add('completed');
  });
}

// ===== VALIDATION =====
function validateStep(step) {
  let valid = true;

  if (step === 1) {
    valid = validateRequired('name', 'err-name')
           & validateRequired('empId', 'err-empId')
           & validateSelect('role', 'err-role')
           & validateSelect('training', 'err-training');
  }

  if (step === 2) {
    const required = ['ptx', 'pe', 'atel', 'thoraco'];
    const allFilled = required.every(name => document.querySelector(`input[name="${name}"]:checked`));
    showError('err-clinical', !allFilled);
    if (!allFilled) valid = false;
  }

  if (step === 3) {
    const dateChecked = document.querySelectorAll('input[name="dates"]:checked').length > 0;
    showError('err-dates', !dateChecked);
    if (!dateChecked) valid = false;
  }

  if (step === 4) {
    ['eff1','eff2','eff3','eff4'].forEach(name => {
      const checked = document.querySelector(`input[name="${name}"]:checked`);
      const errId = `err-${name}`;
      showError(errId, !checked);
      if (!checked) valid = false;
    });
  }

  return !!valid;
}

function validateRequired(fieldId, errId) {
  const val = document.getElementById(fieldId).value.trim();
  showError(errId, !val);
  return !!val;
}

function validateSelect(fieldId, errId) {
  const val = document.getElementById(fieldId).value;
  showError(errId, !val);
  return !!val;
}

function showError(errId, show) {
  const el = document.getElementById(errId);
  if (el) el.classList.toggle('visible', show);
}

// ===== OTHER INPUT TOGGLE =====
function toggleMotivationOther(checkbox) {
  document.getElementById('motivationOther').style.display = checkbox.checked ? 'block' : 'none';
}

// ===== COLLECT DATA =====
function collectFormData() {
  const getVal = id => document.getElementById(id)?.value?.trim() || '';
  const getRadio = name => document.querySelector(`input[name="${name}"]:checked`)?.value || '';
  const getCheckboxes = name => Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
    .map(el => el.value).join(', ');

  const motivationOtherText = document.getElementById('motivationOther').value.trim();
  let motivations = Array.from(document.querySelectorAll('input[name="motivation"]:checked'))
    .map(el => el.value).filter(v => v !== 'other').join(', ');

  return {
    timestamp: new Date().toISOString(),
    name: getVal('name'),
    empId: getVal('empId'),
    role: getVal('role'),
    training: getVal('training'),
    ptx: getRadio('ptx'),
    pe: getRadio('pe'),
    atel: getRadio('atel'),
    thoraco: getRadio('thoraco'),
    dates: getCheckboxes('dates'),
    eff1: getRadio('eff1'),
    eff2: getRadio('eff2'),
    eff3: getRadio('eff3'),
    eff4: getRadio('eff4'),
    motivation: motivations,
    motivationOther: motivationOtherText,
    expectation: getVal('expectation')
  };
}

// ===== SUBMIT =====
document.getElementById('surveyForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateStep(4)) return;

  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = '送出中...';

  try {
    const data = collectFormData();

    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL_HERE') {
      // Demo mode: log to console
      console.log('Demo mode — form data:', data);
      await new Promise(r => setTimeout(r, 800));
    } else {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }

    // Show success
    document.getElementById('surveyForm').classList.add('hidden');
    document.getElementById('progressBar').classList.add('hidden');
    document.querySelector('.site-header').classList.add('hidden');
    document.getElementById('successScreen').classList.remove('hidden');

  } catch (err) {
    btn.disabled = false;
    btn.textContent = '送出問卷 ✓';
    showToast('送出失敗，請稍後再試', 'error');
  }
});

// ===== TOAST =====
function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ===== INIT =====
updateProgress();
