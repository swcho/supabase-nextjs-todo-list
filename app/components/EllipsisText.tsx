import React, { HTMLAttributes } from "react";
import { useComponentSize } from "react-use-size";

// 컴포넌트 Props 타입 정의
interface EllipsisTextProps extends HTMLAttributes<HTMLDivElement> {
  text: string;
  lines?: number;
  lineHeight?: string;
  className?: string;
  tooltipEnabled?: boolean;
}

const EllipsisText: React.FC<EllipsisTextProps> = ({
  text,
  lines = 1,
  lineHeight,
  className = "",
  tooltipEnabled = true,
  ...rest
}) => {
  // 여러 줄 ellipsis 스타일링
  const multiLineStyle: React.CSSProperties = {
    display: "-webkit-box",
    WebkitLineClamp: lines,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight,
  };

  // 한 줄 ellipsis 스타일링
  const singleLineStyle: React.CSSProperties = {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight,
  };

  const { ref, width } = useComponentSize();

  // 줄 수에 따라 스타일 적용
  const style = { ... (lines > 1 ? multiLineStyle : singleLineStyle), 
    width: width ? `${width}px` : undefined
  };
  

  return (
    <div ref={ref} className="relative">
      {/* 높이를위해 */}
      <div style={{ visibility: "hidden" }}>{"I"}</div>
      <div
        className={`ellipsis-text absolute top-0 left-0 ${className}`}
        style={style}
        title={tooltipEnabled ? text : undefined}
        {...rest}
      >
        {text}
      </div>
    </div>
  );
};

export default React.memo(EllipsisText);
