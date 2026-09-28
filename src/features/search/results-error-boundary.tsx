'use client';

import {Component, type ReactNode} from 'react';
import {useTranslations} from 'next-intl';
import {AlertTriangle, RotateCcw} from 'lucide-react';
import {Button} from '@/components/ui/button';

function LoadError({onRetry}: {onRetry: () => void}) {
    const t = useTranslations('Search');
    return (
        <div role="alert" className="flex flex-col items-center rounded-2xl border border-destructive/25 bg-destructive/5 px-6 py-14 text-center">
            <AlertTriangle className="size-9 text-destructive" />
            <h2 className="mt-4 text-lg font-bold">{t('loadErrorTitle')}</h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t('loadErrorHint')}</p>
            <Button type="button" variant="outline" className="mt-6 rounded-xl" onClick={onRetry}>
                <RotateCcw className="mr-2 size-4" />
                {t('retry')}
            </Button>
        </div>
    );
}

interface ResultsErrorBoundaryProps {
    children: ReactNode;
    /** Re-issues the failed Vendure request; the boundary resets alongside it. */
    onRetry: () => void;
}

/**
 * Catches a rejected product-listing promise (Vendure unreachable, CORS,
 * GraphQL error) thrown through `use()` in ProductGrid/FacetFilters, and
 * shows a retryable error instead of an empty or stale grid. It never falls
 * back to cached or fixture products.
 */
export class ResultsErrorBoundary extends Component<ResultsErrorBoundaryProps, {failed: boolean}> {
    state = {failed: false};

    static getDerivedStateFromError() {
        return {failed: true};
    }

    componentDidCatch(error: unknown) {
        console.error('Failed to load products from Vendure', error);
    }

    private retry = () => {
        this.setState({failed: false});
        this.props.onRetry();
    };

    render() {
        return this.state.failed ? <LoadError onRetry={this.retry} /> : this.props.children;
    }
}
