import type { CreateItemDTO } from "@modules/item/item.dtos.js";
import { MESSAGES } from "@src/constants/messages.js";
import { AppError } from "@src/shared/errors/app.error.js";
import { QuantityValidator } from "@src/shared/utils/validators/quantity.validator.js";

export class CreateItemValidator {
    static validate(data: CreateItemDTO & { availableQuantity: number }) {
        const minNameLength = 2;
        const maxNameLength = 50;
        const maxCategoryLength = 30;
        const maxLocationLength = 80;

        const name = data.name?.trim();
        const category = data.category?.trim();
        const location = data.location?.trim();
        const totalQuantity = data.totalQuantity;
        const availableQuantity = data.availableQuantity;

        if (!name) {
            throw new AppError(MESSAGES.ITEM.VALIDATION.NAME_REQUIRED);
        }

        if (name.length < minNameLength) {
            throw new AppError(MESSAGES.ITEM.VALIDATION.NAME_TOO_SHORT(minNameLength));
        }

        if (name.length > maxNameLength) {
            throw new AppError(MESSAGES.ITEM.VALIDATION.NAME_TOO_LONG(maxNameLength));
        }

        if (category) {
            if (category.length > maxCategoryLength) {
                throw new AppError(MESSAGES.ITEM.VALIDATION.CATEGORY_TOO_LONG(maxCategoryLength));
            }
        }

        if (totalQuantity !== undefined) {
            QuantityValidator.validate(totalQuantity);
        }

        if (availableQuantity !== undefined) {
            QuantityValidator.validate(availableQuantity);

            if (totalQuantity !== undefined) {
                if (availableQuantity > totalQuantity) {
                    throw new AppError(MESSAGES.ITEM.VALIDATION.AVAILABLE_QUANTITY_EXCEEDS_TOTAL);
                }
            }
        }

        if (!location) {
            throw new AppError(MESSAGES.ITEM.VALIDATION.LOCATION_REQUIRED);
        }

        if (location.length > maxLocationLength) {
            throw new AppError(MESSAGES.ITEM.VALIDATION.LOCATION_TOO_LONG(maxLocationLength));
        }
    }
}
