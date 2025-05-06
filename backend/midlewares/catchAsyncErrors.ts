type HandleFunction = (...args: any[]) => Promise<any>;

interface IValidationError {
  message: string;
}

// error handle function
function extractErrors(error: any) {
  if (error?.name === "ValidationError") {
    return {
      // Object.values => เป็นเมธอดของ JavaScript ที่ใช้สำหรับดึงค่า (values) ของทุก property ที่ enumerable จาก object ที่ระบุ แล้วส่งคืนเป็น array
      message: Object.values<IValidationError>(error?.errors)
        .map((err: any) => err.message)
        .join(", "),
      statusCode: 400,
    };
  }

  if (error?.response?.data?.message) {
    return {
      message: error.response.data.message,
      statusCode: 400,
    };
  }

  if (error?.message) {
    return {
      message: error.message,
      statusCode: 400,
    };
  }

  return {
    message: "Internal Server Error!",
    statusCode: 500,
  };
}

// "higher order function" ซึ่งหมายถึงฟังก์ชันที่คืนค่าเป็นอีกฟังก์ชันหนึ่ง
// - ฟังก์ชันแรก (ตัวที่ถูกประกาศด้วย arrow function) เมื่อถูกเรียก จะคืนค่าเป็นอีก arrow function
// - ผลที่ได้คือ เมื่อเรียกใช้ catchAsyncErrors() จะได้ฟังก์ชันใหม่ที่สามารถนำไปใช้ต่อได้
export const catchAsyncErrors =
  (handler: HandleFunction) =>
  async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error: any) {
      const { message, statusCode } = extractErrors(error);

      console.log("message : ", message);
      console.log("statusCode : ", statusCode);

      return {
        error: {
          message,
          statusCode,
        },
      };
    }
  };
