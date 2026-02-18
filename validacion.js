let usuario = document.getElementById("usuario");
let password = document.getElementById("password");
let mensaje = document.getElementById("mensaje");
let mensajePassword = document.getElementById("mensajePassword");
let passwordWarningEl = document.getElementById("passwordWarning");
let form = document.getElementById("miForm");
let res = document.getElementById("formMessage");

// Control de intentos fallidos
let intentosFallidos = 0;
let formularioBloqueado = false;
const MAX_INTENTOS = 3;
const TIEMPO_BLOQUEO = 30;

function bloquearFormulario() {
    formularioBloqueado = true;
    const btn = form.querySelector('button[type="submit"]');
    usuario.disabled = true;
    password.disabled = true;
    btn.disabled = true;
    res.innerHTML = `<div class="alert alert-danger"><strong>⛔ Formulario bloqueado.</strong><br>Demasiados intentos fallidos. Intenta de nuevo en ${TIEMPO_BLOQUEO} segundos.</div>`;
    
    let segundosRestantes = TIEMPO_BLOQUEO;
    btn.textContent = `Bloqueado (${segundosRestantes}s)`;
    const intervalo = setInterval(() => {
        segundosRestantes--;
        btn.textContent = `Bloqueado (${segundosRestantes}s)`;
        if (segundosRestantes > 0) {
            res.innerHTML = `<div class="alert alert-danger"><strong>⛔ Formulario bloqueado.</strong><br>Intenta de nuevo en ${segundosRestantes} segundos.</div>`;
        } else {
            clearInterval(intervalo);
            desbloquearFormulario();
        }
    }, 1000);
}

function desbloquearFormulario() {
    formularioBloqueado = false;
    intentosFallidos = 0;
    const btn = form.querySelector('button[type="submit"]');
    usuario.disabled = false;
    password.disabled = false;
    btn.disabled = false;
    btn.textContent = 'Enviar';
    res.innerHTML = '<div class="alert alert-info">✓ Formulario desbloqueado. Intenta de nuevo.</div>';
    setTimeout(() => res.innerHTML = '', 3000);
}

function validarPassword(pwd) {
    const req = {
        lng: pwd.length >= 8,
        may: /[A-Z]/.test(pwd),
        min: /[a-z]/.test(pwd),
        num: /[0-9]/.test(pwd),
        esp: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
    };
    const cump = Object.values(req).filter(v => v).length;
    const errores = [];
    !req.lng && errores.push("✗ Mínimo 8 caracteres");
    !req.may && errores.push("✗ Mayúscula (A-Z)");
    !req.min && errores.push("✗ Minúscula (a-z)");
    !req.num && errores.push("✗ Número (0-9)");
    !req.esp && errores.push("✗ Carácter especial (obligatorio)");
    // Si falta carácter especial, no es válida; si cumple los 5, es válida
    const nivel = !req.esp ? 'débil' : cump === 5 ? 'fuerte' : 'media';
    return { cumplidos: cump, errores, nivel };
}

function validarUsuario(usu) {
    const errores = [];
    
    if (!usu || usu.trim() === '') {
        errores.push("✗ Usuario es obligatorio");
    } else {
        if (usu.length < 3) {
            errores.push("✗ Usuario: mínimo 3 caracteres");
        }
        if (usu.length > 20) {
            errores.push("✗ Usuario: máximo 20 caracteres");
        }
        if (!/^[a-zA-Z]/.test(usu)) {
            errores.push("✗ Usuario debe empezar con una letra");
        }
        if (!/^[a-zA-Z0-9._-]+$/.test(usu)) {
            errores.push("✗ Usuario solo permite letras, números, puntos, guiones y guiones bajos");
        }
    }
    
    return { valido: errores.length === 0, errores };
}
usuario.addEventListener("input", function() {
    this.value = this.value.replace(/[^a-zA-Z0-9._-]/g, '');
    if (!this.value) {
        this.style.border = "2px solid red";
        mensaje.textContent = "Campo obligatorio";
        mensaje.style.color = "red";
    } else if (this.value.length < 3) {
        this.style.border = "2px solid red";
        mensaje.textContent = "Mínimo 3 caracteres";
        mensaje.style.color = "red";
    } else {
        this.style.border = "2px solid green";
        mensaje.textContent = "✓ Usuario válido";
        mensaje.style.color = "green";
    }
});
if (password) {
    const max = password.getAttribute('maxlength') || 20;
    document.getElementById("passwordMax").textContent = max;
    
    password.addEventListener('input', function() {
        document.getElementById("passwordCount").textContent = this.value.length;
        const val = validarPassword(this.value);
        const colores = { fuerte: 'green', media: 'orange', débil: 'red' };
        
        if (!this.value) {
            this.style.border = '2px solid #ccc';
            mensajePassword.textContent = '';
            passwordWarningEl.style.display = 'none';
        } else {
            this.style.border = `2px solid ${colores[val.nivel]}`;
            mensajePassword.textContent = val.nivel === 'fuerte' ? '✓ Contraseña válida' : val.nivel === 'media' ? '⚠️ Media' : '⚠️ Débil';
            mensajePassword.style.color = colores[val.nivel];
            passwordWarningEl.innerHTML = val.errores.length ? val.errores.join('<br>') : '';
            passwordWarningEl.style.display = val.errores.length ? 'block' : 'none';
        }
    });
    
    document.getElementById("togglePassword").addEventListener('click', function() {
        const tipo = password.type === 'password' ? 'text' : 'password';
        password.type = tipo;
        this.textContent = tipo === 'password' ? 'Mostrar' : 'Ocultar';
    });
}
form.addEventListener("submit", function(e) {
    e.preventDefault();
    
    if (formularioBloqueado) {
        res.innerHTML = '<div class="alert alert-danger"><strong>⛔ Formulario bloqueado.</strong> Espera antes de intentar de nuevo.</div>';
        return;
    }
    const usuVal = usuario.value.trim();
    const pwdVal = password.value;
    let validoOk = true;
    
    // Validación de usuario (validación adicional)
    const valUsu = validarUsuario(usuVal);
    if (!valUsu.valido) {
        res.innerHTML = '<div class="alert alert-danger"><strong>❌ Usuario inválido:</strong><br>' + valUsu.errores.join('<br>') + '</div>';
        usuario.focus();
        validoOk = false;
    } else if (!pwdVal) {
        res.innerHTML = '<div class="alert alert-danger">❌ Contraseña obligatoria.</div>';
        password.focus();
        validoOk = false;
    } else {
        const val = validarPassword(pwdVal);
        if (val.cumplidos < 5) {
            res.innerHTML = '<div class="alert alert-danger"><strong>❌ Contraseña inválida.</strong><br>' + val.errores.join('<br>') + '</div>';
            password.focus();
            validoOk = false;
        }
    }
    
    if (!validoOk) {
        intentosFallidos++;
        if (intentosFallidos >= MAX_INTENTOS) {
            bloquearFormulario();
        } else {
            res.innerHTML += `<p style="margin-top:10px; color:#666;"><small>Intentos fallidos: ${intentosFallidos}/${MAX_INTENTOS}</small></p>`;
        }
        return;
    }
    res.innerHTML = '<div class="alert alert-success"><strong>✓ Formulario enviado correctamente.</strong> Bienvenido!</div>';
    usuario.value = password.value = '';
    mensaje.textContent = mensajePassword.textContent = '';
    usuario.style.border = password.style.border = '';
    document.getElementById("passwordCount").textContent = '0';
    intentosFallidos = 0;
    setTimeout(() => res.innerHTML = '', 4000);
});