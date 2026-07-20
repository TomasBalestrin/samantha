import './style.css'

/* ---------- ano no rodapé ---------- */
const yearEl = document.getElementById('year')
if (yearEl) yearEl.textContent = String(new Date().getFullYear())

/* ---------- reveal on scroll ---------- */
const revealTargets = document.querySelectorAll(
  '.section__head, .discover__item, .note, .shift__lead, .shift__answer, ' +
  '.shift__cols, .shift__punch, .fit__card, .host__media, .host__body, ' +
  '.pillar, .after__title, .after__text, .carousel, .form, .apply__sub'
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

/* ---------- envio da aplicação ---------- */
const form = document.getElementById('application-form')
const success = document.getElementById('success')

function markError(field, on) {
  const wrapper = field.closest('.field')
  if (wrapper) wrapper.classList.toggle('field--error', on)
}

if (form) {
  // limpa o estado de erro ao interagir
  form.addEventListener('input', (e) => {
    const t = e.target
    if (t.name) {
      form.querySelectorAll(`[name="${CSS.escape(t.name)}"]`).forEach((el) => markError(el, false))
    }
  })

  form.addEventListener('submit', (e) => {
    e.preventDefault()

    // valida grupos (inputs, textareas e radios obrigatórios)
    let firstInvalid = null
    const required = form.querySelectorAll('[required]')
    const seenRadio = new Set()

    for (const el of required) {
      let invalid = false
      if (el.type === 'radio') {
        if (seenRadio.has(el.name)) continue
        seenRadio.add(el.name)
        invalid = !form.querySelector(`input[name="${CSS.escape(el.name)}"]:checked`)
      } else {
        invalid = !el.value.trim()
      }
      markError(el, invalid)
      if (invalid && !firstInvalid) firstInvalid = el
    }

    if (firstInvalid) {
      firstInvalid.closest('.field')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      if (typeof firstInvalid.focus === 'function') firstInvalid.focus({ preventScroll: true })
      return
    }

    // coleta as respostas
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
}
