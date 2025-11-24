import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ResponsiveFlex, ResponsiveText } from "@/components/ui/responsive-container";

interface HeaderProps { 
    headerName: string;
    headerDescription: string;
    buttonName: string;
}

export function Header({headerName, headerDescription, buttonName}: HeaderProps) { 
    return (
        <ResponsiveFlex direction="responsive" align="center" justify="between" gap="md" className="mb-1">
            <div>
                <ResponsiveText size="xl" weight="bold" className="text-gray-900 dark:text-white">
                    {headerName}
                </ResponsiveText>
                <ResponsiveText size="sm" color="muted">
                    {headerDescription}
                </ResponsiveText>
            </div>
            <Button className="bg-black hover:bg-gray-800 text-white w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                {buttonName}
            </Button>
        </ResponsiveFlex>
    );
}