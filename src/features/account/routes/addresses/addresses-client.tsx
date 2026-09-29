'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Home, CreditCard, Edit2, MapPin, Trash2 } from 'lucide-react';
import { AddressForm } from './address-form';
import { createAddress, updateAddress, deleteAddress, setDefaultShippingAddress, setDefaultBillingAddress } from './actions';
import {useTranslations} from 'next-intl';

export interface Country {
    id: string;
    code: string;
    name: string;
}

export interface CustomerAddress {
    id: string;
    fullName?: string | null;
    company?: string | null;
    streetLine1: string;
    streetLine2?: string | null;
    city?: string | null;
    province?: string | null;
    postalCode?: string | null;
    country: { id: string; code: string; name: string };
    phoneNumber?: string | null;
    defaultShippingAddress?: boolean | null;
    defaultBillingAddress?: boolean | null;
}

interface AddressesClientProps {
    addresses: CustomerAddress[];
    countries: Country[];
    onRefresh: () => Promise<void>;
}

export function AddressesClient({ addresses, countries, onRefresh }: AddressesClientProps) {
    const t = useTranslations('Account');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [settingDefault, setSettingDefault] = useState<{ id: string; type: 'shipping' | 'billing' } | null>(null);

    const handleAddNew = () => {
        setEditingAddress(null);
        setDialogOpen(true);
    };

    const handleEdit = (address: CustomerAddress) => {
        setEditingAddress(address);
        setDialogOpen(true);
    };

    const handleDelete = (addressId: string) => {
        setAddressToDelete(addressId);
        setDeleteDialogOpen(true);
    };

    const handleSetDefaultShipping = async (addressId: string) => {
        setSettingDefault({ id: addressId, type: 'shipping' });
        try {
            await setDefaultShippingAddress(addressId);
            await onRefresh();
        } catch (error) {
            console.error('Error setting default shipping address:', error);
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setSettingDefault(null);
        }
    };

    const handleSetDefaultBilling = async (addressId: string) => {
        setSettingDefault({ id: addressId, type: 'billing' });
        try {
            await setDefaultBillingAddress(addressId);
            await onRefresh();
        } catch (error) {
            console.error('Error setting default billing address:', error);
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setSettingDefault(null);
        }
    };

    const confirmDelete = async () => {
        if (!addressToDelete) return;

        setIsDeleting(true);
        try {
            await deleteAddress(addressToDelete);
            await onRefresh();
            setDeleteDialogOpen(false);
            setAddressToDelete(null);
        } catch (error) {
            console.error('Error deleting address:', error);
            alert(`Error deleting address: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsDeleting(false);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (editingAddress) {
                await updateAddress(data);
            } else {
                await createAddress(data);
            }
            await onRefresh();
            setDialogOpen(false);
            setEditingAddress(null);
        } catch (error) {
            console.error('Error saving address:', error);
            alert(`Error saving address: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="spec-label text-steel">{t('savedAddressCount', {count: addresses.length})}</p>
                <Button onClick={handleAddNew} className="h-10 rounded-lg bg-brand px-4 font-semibold text-brand-foreground hover:bg-brand/90">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('addNewAddress')}
                </Button>
            </div>

            {addresses.length === 0 ? (
                <div className="flex flex-col items-center rounded-xl border border-border bg-surface px-5 py-14 text-center">
                    <span className="flex size-12 items-center justify-center rounded-lg border border-border bg-card text-steel">
                        <MapPin className="size-5" />
                    </span>
                    <p className="mt-4 mb-5 text-sm text-muted-foreground">{t('noAddressesSaved')}</p>
                    <Button onClick={handleAddNew} className="h-10 rounded-lg bg-brand px-4 font-semibold text-brand-foreground hover:bg-brand/90">
                        <Plus className="mr-2 h-4 w-4" />
                        {t('addFirstAddress')}
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {addresses.map((address) => (
                        <Card
                            key={address.id}
                            className={address.defaultShippingAddress ? 'shadow-none ring-brand/40' : 'shadow-none'}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <CardTitle className="break-words font-display text-lg font-bold">{address.fullName}</CardTitle>
                                        {(address.defaultShippingAddress || address.defaultBillingAddress) && (
                                            <div className="flex flex-wrap gap-2">
                                                {address.defaultShippingAddress && (
                                                    <Badge variant="secondary" className="rounded-md bg-brand/10 text-brand">
                                                        <Home className="mr-1 size-3" />
                                                        {t('defaultShipping')}
                                                    </Badge>
                                                )}
                                                {address.defaultBillingAddress && (
                                                    <Badge variant="secondary" className="rounded-md bg-steel-soft text-foreground">
                                                        <CreditCard className="mr-1 size-3" />
                                                        {t('defaultBilling')}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-lg" aria-label={t('addressActions')} />}>
                                                <MoreVertical className="h-4 w-4" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(address)}>
                                                <Edit2 className="mr-2 h-4 w-4" />
                                                {t('edit')}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => handleSetDefaultShipping(address.id)}
                                                disabled={
                                                    address.defaultShippingAddress ||
                                                    (settingDefault?.id === address.id && settingDefault?.type === 'shipping')
                                                }
                                            >
                                                <Home className="mr-2 h-4 w-4" />
                                                {address.defaultShippingAddress ? t('defaultShipping') : t('setAsShipping')}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleSetDefaultBilling(address.id)}
                                                disabled={
                                                    address.defaultBillingAddress ||
                                                    (settingDefault?.id === address.id && settingDefault?.type === 'billing')
                                                }
                                            >
                                                <CreditCard className="mr-2 h-4 w-4" />
                                                {address.defaultBillingAddress ? t('defaultBilling') : t('setAsBilling')}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(address.id)}
                                                className="text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                                                {t('delete')}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1 break-words text-sm text-muted-foreground">
                                    {address.company && <p>{address.company}</p>}
                                    <p>
                                        {address.streetLine1}
                                        {address.streetLine2 && `, ${address.streetLine2}`}
                                    </p>
                                    <p>
                                        {address.city}, {address.province} {address.postalCode}
                                    </p>
                                    <p>{address.country.name}</p>
                                    <p>{address.phoneNumber}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-display-wide text-xl font-extrabold">{editingAddress ? t('editAddress') : t('addNewAddressDialog')}</DialogTitle>
                        <DialogDescription>
                            {editingAddress
                                ? t('updateAddressDetails')
                                : t('fillAddressForm')}
                        </DialogDescription>
                    </DialogHeader>
                    <AddressForm
                        countries={countries}
                        address={editingAddress || undefined}
                        onSubmit={handleSubmit}
                        onCancel={() => {
                            setDialogOpen(false);
                            setEditingAddress(null);
                        }}
                        isSubmitting={isSubmitting}
                    />
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('deleteConfirmDescription')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
                            {isDeleting ? t('deleting') : t('delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
