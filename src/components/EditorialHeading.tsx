// The existing Chinese h2 retains the chapter's accessible heading.
export default function EditorialHeading({ text }: { text: string }) {
  return <p className="editorial-heading" aria-hidden="true">
    {text.split("\n").map((line, index) => <span className="editorial-heading__mask" key={index}>
      <span className="editorial-heading__word">{line}</span>
    </span>)}
  </p>;
}
