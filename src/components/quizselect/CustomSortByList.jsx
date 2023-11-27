export default function CustomSortByList() {
  return (
    <label class="text-white mx-2">
      Sort by
      <select name="listSortMethod" defaultValue="newest" class="text-black mx-2">
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="alpha">Title A-{">"}Z</option>
        <option value="alphaReverse">Title Z-{">"}A</option>
        <option value="shortest">Shortest</option>
        <option value="longest">Longest</option>
      </select>
    </label>
  );
}