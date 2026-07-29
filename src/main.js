import './style.css'

/* ---------- ano no rodapé ---------- */
const yearEl = document.getElementById('year')
if (yearEl) yearEl.textContent = String(new Date().getFullYear())

/* ---------- reveal on scroll ---------- */
const revealTargets = document.querySelectorAll(
  '.section__head, .discover__item, .note, .shift__lead, .shift__answer, ' +
  '.shift__cols, .shift__punch, .fit__card, .host__media, .host__body, ' +
  '.pillar, .after__title, .after__text, .carousel, .cta-inline, .quiz, .apply__sub'
)
revealTargets.forEach((el, i) => {
  el.setAttribute('data-reveal', '')
  el.style.transitionDelay = `${Math.min((i % 6) * 60, 300)}ms`
})

if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in')
          io.unobserve(entry.target)
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  )
  revealTargets.forEach((el) => io.observe(el))
} else {
  revealTargets.forEach((el) => el.classList.add('is-in'))
}

/* ---------- carrossel de depoimentos ---------- */
document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('.carousel__track')
  const prev = carousel.querySelector('.carousel__btn--prev')
  const next = carousel.querySelector('.carousel__btn--next')
  if (!track || !prev || !next) return

  const step = () => {
    const item = track.querySelector('.carousel__item')
    const gap = parseFloat(getComputedStyle(track).columnGap) || 20
    return item ? item.getBoundingClientRect().width + gap : track.clientWidth * 0.8
  }

  const update = () => {
    const max = track.scrollWidth - track.clientWidth - 1
    prev.disabled = track.scrollLeft <= 1
    next.disabled = track.scrollLeft >= max
  }

  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }))
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }))
  track.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
  update()
})

/* ---------- máscara simples de WhatsApp ---------- */
const phone = document.getElementById('whatsapp')
if (phone) {
  phone.addEventListener('input', () => {
    let d = phone.value.replace(/\D/g, '').slice(0, 11)
    if (d.length > 6) phone.value = `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
    else if (d.length > 2) phone.value = `(${d.slice(0, 2)}) ${d.slice(2)}`
    else if (d.length > 0) phone.value = `(${d}`
    else phone.value = ''
  })
}

/* ---------- quiz de aplicação (uma pergunta por etapa) ---------- */
const form = document.getElementById('application-form')
const success = document.getElementById('success')

if (form) {
  const steps = Array.from(form.querySelectorAll('[data-step]'))
  const total = steps.length
  const fill = document.getElementById('quiz-fill')
  const currentEl = document.getElementById('quiz-current')
  const totalEl = document.getElementById('quiz-total')
  const errEl = document.getElementById('quiz-err')
  const backBtn = form.querySelector('[data-back]')
  const nextBtn = form.querySelector('[data-next]')
  const submitBtn = form.querySelector('[data-submit]')

  let index = 0
  if (totalEl) totalEl.textContent = String(total)

  const clearErr = () => { if (errEl) { errEl.hidden = true; errEl.textContent = '' } }

  const showError = (msg) => {
    if (errEl) { errEl.textContent = msg; errEl.hidden = false }
    steps[index].classList.add('step--error')
  }

  // valida apenas a etapa atual
  const validateStep = () => {
    const step = steps[index]
    const radios = step.querySelectorAll('input[type="radio"]')
    if (radios.length) {
      const name = radios[0].name
      return form.querySelector(`input[name="${CSS.escape(name)}"]:checked`)
        ? true : (showError('Selecione uma opção para continuar.'), false)
    }
    const field = step.querySelector('input, textarea')
    if (field && !field.value.trim()) {
      return showError('Preencha este campo para continuar.'), false
    }
    return true
  }

  const render = () => {
    steps.forEach((s, i) => s.classList.toggle('is-active', i === index))
    const isLast = index === total - 1
    if (fill) fill.style.width = `${((index + 1) / total) * 100}%`
    if (currentEl) currentEl.textContent = String(index + 1)
    if (backBtn) backBtn.hidden = index === 0
    if (nextBtn) nextBtn.hidden = isLast
    if (submitBtn) submitBtn.hidden = !isLast
    clearErr()
    // foca o primeiro campo de texto da etapa (sem rolar a página)
    const focusable = steps[index].querySelector('input[type="text"], input[type="tel"], textarea')
    if (focusable) focusable.focus({ preventScroll: true })
  }

  const goNext = () => {
    if (!validateStep()) return
    if (index < total - 1) { index++; render() }
  }
  const goBack = () => { if (index > 0) { index--; render() } }

  if (nextBtn) nextBtn.addEventListener('click', goNext)
  if (backBtn) backBtn.addEventListener('click', goBack)

  // limpa erro ao interagir
  form.addEventListener('input', () => { steps[index].classList.remove('step--error'); clearErr() })

  // avanço automático ao escolher uma opção (etapas marcadas com data-auto)
  form.addEventListener('change', (e) => {
    const step = steps[index]
    if (e.target.type === 'radio' && step.hasAttribute('data-auto')) {
      setTimeout(goNext, 260)
    }
  })

  // Enter avança nos campos de texto (não no textarea)
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
      e.preventDefault()
      goNext()
    }
  })

  form.addEventListener('submit', (e) => {
    e.preventDefault()
    if (!validateStep()) return

    const data = Object.fromEntries(new FormData(form).entries())
    // TODO: conectar a um destino real (webhook, e-mail, planilha ou CRM).
    // Ex.: fetch('/api/aplicacao', { method: 'POST', body: JSON.stringify(data) })
    console.info('Aplicação MFV recebida:', data)

    form.hidden = true
    if (success) {
      success.hidden = false
      success.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })

  render()
}
