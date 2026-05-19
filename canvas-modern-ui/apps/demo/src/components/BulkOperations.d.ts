import React from 'react';
/**
 * Bulk operation types
 */
export type BulkOperationType = 'delete' | 'archive' | 'download' | 'edit' | 'email' | 'grade' | 'publish' | 'unpublish';
/**
 * Bulk operation configuration
 */
interface BulkOperation {
    id: BulkOperationType;
    label: string;
    icon: React.ComponentType<any>;
    description: string;
    confirmationRequired: boolean;
    destructive: boolean;
    requiresInput?: boolean;
    inputType?: 'text' | 'number' | 'select' | 'textarea';
    inputOptions?: Array<{
        value: string;
        label: string;
    }>;
}
/**
 * Bulk operations component props
 */
interface BulkOperationsProps<T> {
    items: T[];
    selectedItems: T[];
    onSelectionChange: (selectedItems: T[]) => void;
    operations: BulkOperation[];
    onExecuteOperation: (operation: BulkOperationType, items: T[], input?: any) => Promise<void>;
    getItemId: (item: T) => string;
    getItemLabel: (item: T) => string;
    renderItem?: (item: T) => React.ReactNode;
    className?: string;
    'data-testid'?: string;
}
/**
 * Bulk Operations Component
 *
 * Provides bulk operation capabilities for lists of items with progress tracking,
 * confirmation dialogs, and error handling.
 */
export declare const BulkOperations: React.NamedExoticComponent<BulkOperationsProps<any>>;
/**
 * Common bulk operations for different content types
 */
export declare const commonBulkOperations: {
    assignments: ({
        id: BulkOperationType;
        label: string;
        icon: import("@carbon/icons-react").CarbonIconType;
        description: string;
        confirmationRequired: boolean;
        destructive: boolean;
        requiresInput?: undefined;
        inputType?: undefined;
    } | {
        id: BulkOperationType;
        label: string;
        icon: import("@carbon/icons-react").CarbonIconType;
        description: string;
        confirmationRequired: boolean;
        destructive: boolean;
        requiresInput: boolean;
        inputType: "number";
    })[];
    students: ({
        id: BulkOperationType;
        label: string;
        icon: import("@carbon/icons-react").CarbonIconType;
        description: string;
        confirmationRequired: boolean;
        destructive: boolean;
        requiresInput: boolean;
        inputType: "textarea";
    } | {
        id: BulkOperationType;
        label: string;
        icon: import("@carbon/icons-react").CarbonIconType;
        description: string;
        confirmationRequired: boolean;
        destructive: boolean;
        requiresInput?: undefined;
        inputType?: undefined;
    })[];
    files: {
        id: BulkOperationType;
        label: string;
        icon: import("@carbon/icons-react").CarbonIconType;
        description: string;
        confirmationRequired: boolean;
        destructive: boolean;
    }[];
};
export {};
//# sourceMappingURL=BulkOperations.d.ts.map