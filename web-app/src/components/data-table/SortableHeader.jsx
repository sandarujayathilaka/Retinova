import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";

const SortableHeader = ({ column, title }) => {
  const handleSorting = () => {
    const currentSort = column.getIsSorted();

    if (!currentSort) {
      column.toggleSorting(false); // Sort ascending (first click)
    } else if (currentSort === "asc") {
      column.toggleSorting(true); // Sort descending (second click)
    } else if (currentSort === "desc") {
      column.toggleSorting(undefined); // Remove sorting (third click)
    }
  };

  return (
    <Button variant="ghost" onClick={handleSorting}>
      {title}
      {column.getIsSorted() === "asc" ? (
        <ArrowUp />
      ) : column.getIsSorted() === "desc" ? (
        <ArrowDown />
      ) : (
        <ArrowUpDown />
      )}
    </Button>
  );
};

export default SortableHeader;
