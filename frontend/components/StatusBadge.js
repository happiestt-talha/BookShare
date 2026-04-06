import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const configs = {
    available: { label: 'Available', cls: 'bg-sage/20 text-forest border-sage/30' },
    pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
    borrowed: { label: 'Borrowed', cls: 'bg-orange-100 text-orange-800 border-orange-200' },
    accepted: { label: 'Accepted', cls: 'bg-green-100 text-green-800 border-green-200' },
    rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-800 border-red-200' },
    returned: { label: 'Returned', cls: 'bg-gray-100 text-gray-600 border-gray-200' },
    alternative_suggested: { label: 'Alt. Suggested', cls: 'bg-purple-100 text-purple-800 border-purple-200' },
    physical: { label: 'Physical', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    digital: { label: 'Digital', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
    member: { label: 'Member', cls: 'bg-forest/10 text-forest border-forest/20' },
    admin: { label: 'Admin', cls: 'bg-red-50 text-red-700 border-red-200' },
    active: { label: 'Active', cls: 'bg-green-50 text-green-700 border-green-200' },
    blocked: { label: 'Blocked', cls: 'bg-red-50 text-red-700 border-red-200' },
}

export default function StatusBadge({ status, className }) {
    const config = configs[status] || { label: status, cls: 'bg-gray-100 text-gray-600' }
    return (
        <Badge variant="outline" className={cn('text-xs font-medium capitalize', config.cls, className)}>
            {config.label}
        </Badge>
    )
}