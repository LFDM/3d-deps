import { ChromePicker } from "react-color";

export const ColorPicker = ({
  value,
  onChange,
  label,
}: {
  label: React.ReactNode;
  value: string;
  onChange: (nextValue: string) => void;
}) => {
  return (
    <div>
      <div>
        <label>{label}</label>
      </div>
      <ChromePicker
        color={value}
        onChangeComplete={(nextColor) => onChange(nextColor.hex)}
      />
    </div>
  );
};
