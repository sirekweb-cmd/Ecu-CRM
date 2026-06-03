/**
 * Utilidades de validación de identificaciones ecuatorianas (Cédula y RUC)
 * basado en algoritmos oficiales del SRI y Registro Civil de Ecuador.
 */

/**
 * Valida una Cédula de Identidad Ecuatoriana (10 dígitos).
 */
export function validateCedula(cedula: string): boolean {
  // Limpiar caracteres no numéricos
  const cleanCedula = cedula.replace(/\D/g, '');

  if (cleanCedula.length !== 10) {
    return false;
  }

  // Verificar provincia (primeros dos dígitos entre 01 y 24, o 30 para extranjeros)
  const provincia = parseInt(cleanCedula.substring(0, 2), 10);
  if ((provincia < 1 || provincia > 24) && provincia !== 30) {
    return false;
  }

  // Tercer dígito debe ser menor a 6 para personas naturales
  const tercerDigito = parseInt(cleanCedula.charAt(2), 10);
  if (tercerDigito >= 6) {
    return false;
  }

  // Algoritmo de Luhn modificado (coeficientes 2.1.2.1.2.1.2.1.2)
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(cleanCedula.charAt(i), 10) * coeficientes[i];
    if (valor >= 10) {
      valor -= 9;
    }
    suma += valor;
  }

  const digitoVerificador = parseInt(cleanCedula.charAt(9), 10);
  const residuo = suma % 10;
  const digitoCalculado = residuo === 0 ? 0 : 10 - residuo;

  return digitoVerificador === digitoCalculado;
}

/**
 * Valida un RUC Ecuatoriano (13 dígitos).
 * Soporta Personas Naturales, Sociedades Privadas y Entidades Públicas.
 */
export function validateRuc(ruc: string): boolean {
  const cleanRuc = ruc.replace(/\D/g, '');

  if (cleanRuc.length !== 13) {
    return false;
  }

  // Los últimos tres dígitos del RUC no pueden ser 000
  const ultimosTres = cleanRuc.substring(10, 13);
  if (ultimosTres === '000') {
    return false;
  }

  const provincia = parseInt(cleanRuc.substring(0, 2), 10);
  if ((provincia < 1 || provincia > 24) && provincia !== 30) {
    return false;
  }

  const tercerDigito = parseInt(cleanRuc.charAt(2), 10);

  // Caso 1: Persona Natural (Tercer dígito < 6)
  // El RUC de persona natural son los 10 dígitos de la cédula + un establecimiento (usualmente 001)
  if (tercerDigito < 6) {
    const cedulaPart = cleanRuc.substring(0, 10);
    return validateCedula(cedulaPart);
  }

  // Caso 2: Sociedad Privada o Extranjeros sin cédula (Tercer dígito = 9)
  if (tercerDigito === 9) {
    const coeficientes = [4, 3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      suma += parseInt(cleanRuc.charAt(i), 10) * coeficientes[i];
    }
    const residuo = suma % 11;
    const digitoCalculado = residuo === 0 ? 0 : 11 - residuo;
    const digitoVerificador = parseInt(cleanRuc.charAt(9), 10);
    return digitoVerificador === digitoCalculado;
  }

  // Caso 3: Entidades Públicas (Tercer dígito = 6)
  if (tercerDigito === 6) {
    const coeficientes = [3, 2, 7, 6, 5, 4, 3, 2];
    let suma = 0;
    for (let i = 0; i < 8; i++) {
      suma += parseInt(cleanRuc.charAt(i), 10) * coeficientes[i];
    }
    const residuo = suma % 11;
    const digitoCalculado = residuo === 0 ? 0 : 11 - residuo;
    const digitoVerificador = parseInt(cleanRuc.charAt(8), 10);
    return digitoVerificador === digitoCalculado;
  }

  return false;
}

/**
 * Validador general que determina el tipo y devuelve un objeto informativo con el resultado.
 */
export function validateId(id: string): { isValid: boolean; message: string; type?: 'cédula' | 'ruc' } {
  const cleanId = id.replace(/\D/g, '');

  if (cleanId.length === 10) {
    const isValid = validateCedula(cleanId);
    return {
      isValid,
      message: isValid ? 'Cédula válida' : 'El número de cédula ingresado no es válido (dígito verificador incorrecto).',
      type: 'cédula'
    };
  } else if (cleanId.length === 13) {
    const isValid = validateRuc(cleanId);
    return {
      isValid,
      message: isValid ? 'RUC válido' : 'El número de RUC ingresado no es válido. Verifique los dígitos.',
      type: 'ruc'
    };
  } else {
    return {
      isValid: false,
      message: 'La identificación ecuatoriana debe tener 10 dígitos para Cédula o 13 dígitos para RUC.'
    };
  }
}
