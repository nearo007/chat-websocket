export const PT_MESSAGES = {
    USER: {
        NOT_FOUND: {
            GENERAL: "Nenhum usuário cadastrado.",
            BY_ID: "Não foi possível encontrar um usuário com esse ID.",
            BY_USERNAME: "Não foi possível encontrar o usuário.",
            BY_EMAIL: "Não foi possível encontrar um usuário com esse email.",
        },
        CONFLICT: {
            USERNAME_EXISTS: "Este nome de usuário já está em uso.",
            EMAIL_EXISTS: "Este e-mail já está cadastrado no sistema.",
            PASSWORDS_DO_NOT_MATCH: "As senhas não coincidem.",
        },
        VALIDATION: {
            USERNAME_REQUIRED: "O usuário é obrigatório",
            USERNAME_INVALID: "O usuário é inválido",
            USERNAME_TOO_SHORT: (num: number) =>
                `O usuário deve conter pelo menos ${num} caracteres.`,
            USERNAME_TOO_LONG: (num: number) => `O usuário deve ter no máximo ${num} caracteres.`,
            EMAIL_REQUIRED: "O e-mail é obrigatório.",
            EMAIL_INVALID: "O e-mail é inválido.",
            PASSWORD_REQUIRED: "A senha é obrigatória",
            PASSWORD_INVALID: "A senha é inválida",
            PASSWORD_TOO_SHORT: (num: number) =>
                `A senha deve conter pelo menos ${num} caracteres válidos.`,
            PASSWORD_TOO_LONG: (num: number) => `A senha deve ter no máximo ${num} bytes.`,
        },
        AUTH: {
            INCORRECT_CREDENTIALS: "Credenciais inválidas.",
            TOKEN: {
                NOT_FOUND: "Token ausente.",
                INVALID_OR_EXPIRED: "Token inválido ou expirado.",
            },
        },
    },

    ITEM: {
        NOT_FOUND: {
            GENERAL: "Esse item não está cadastrado no sistema.",
            BY_ID: "Não foi possível encontrar um item com esse ID.",
        },
        VALIDATION: {
            NAME_REQUIRED: "O nome do item é obrigatório.",
            NAME_TOO_SHORT: (num: number) =>
                `O nome do item deve conter pelo menos ${num} caracteres.`,
            NAME_TOO_LONG: (num: number) => `O nome do item deve ter no máximo ${num} caracteres.`,

            CATEGORY_TOO_LONG: (num: number) => `A categoria deve ter no máximo ${num} caracteres.`,

            LOCATION_REQUIRED: "A localização é obrigatória.",
            LOCATION_TOO_LONG: (num: number) =>
                `A localização deve ter no máximo ${num} caracteres.`,
            AVAILABLE_QUANTITY_EXCEEDS_TOTAL:
                "A quantidade disponível para empréstimo não pode ser maior que a quantidade total.",
        },
    },
    LOAN: {
        NOT_FOUND: {
            BY_ID: "Não foi possível encontrar um empréstimo com esse ID.",
        },
        VALIDATION: {
            QUANTITY_TOO_BIG: (num: number) => `Quantidade máxima disponível em estoque: ${num}.`,
            DUE_DATE_BEFORE_LOAN:
                "A data de vencimento deve ser posterior ou igual à data do empréstimo.",
            RETURN_DATE_BEFORE_LOAN:
                "A data de devolução deve ser posterior ou igual à data do empréstimo.",
        },
    },
    CLIENT: {
        NOT_FOUND: {
            GENERAL: "Nenhum cliente cadastrado.",
            BY_ID: "Não foi possível encontrar um cliente com esse ID.",
        },
        CONFLICT: {
            EMAIL_EXISTS: "Este e-mail já está cadastrado no sistema.",
        },
        VALIDATION: {
            NAME_REQUIRED: "O nome do cliente é obrigatório.",
            NAME_TOO_SHORT: (num: number) =>
                `O nome do cliente deve conter pelo menos ${num} caracteres.`,
            NAME_TOO_LONG: (num: number) =>
                `O nome do cliente deve ter no máximo ${num} caracteres.`,
        },
    },
    SHARED: {
        VALIDATION: {
            QUANTITY_REQUIRED: "A quantidade é obrigatória.",
            QUANTITY_INVALID: "A quantidade deve ser um número válido.",
            QUANTITY_NEGATIVE: "A quantidade não pode ser negativa.",
            QUANTITY_TOO_LOW: (min: number) => `A quantidade mínima é ${min}.`,
            QUANTITY_TOO_HIGH: (max: number) => `A quantidade máxima é ${max}.`,
            REQUIRED_FIELD: (fieldName: string) => `O campo ${fieldName} é obrigatório(a).`,
            INVALID_FIELD: (fieldName: string) => `O campo ${fieldName} é inválido(a).`,
            PHONE_INVALID: "O telefone deve conter entre 8 e 15 dígitos.",
        },
    },
    FIELDS: {
        ID: "ID",
        DATE: "Data",
        RETURN_DATE: "Data de Devolução",
        LOAN_DATE: "Data de Empréstimo",
        DUE_DATE: "Data de Vencimento",
    },
} as const;
