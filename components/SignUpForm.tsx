"use client";

import { useForm } from "react-hook-form";
import { useSignUp } from "@clerk/nextjs";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/schemas/signUpSchema";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardHeader, CardBody } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { CircleAlert } from "lucide-react";
import { Button } from "@heroui/button";
import {Input} from "@heroui/input";

export default function SignUpForm() {
  const router = useRouter();

  const [verifying, setVerifying] = useState(false);
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [verificationCode, setVerificationCode] = useState("");
  const { signUp, isLoaded, setActive } = useSignUp();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    if (!isLoaded) return <h1>Loading...</h1>;
    setIsSubmiting(true);
    setAuthError(null);

    try {
      await signUp.create({
        emailAddress: data.email,
        password: data.password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setVerifying(true);
    } catch (error: any) {
      console.error("Error when submitting: ", error);
      setAuthError(
        error.errors?.[0]?.message || "Something went wrong when signing up"
      );
    } finally {
      setIsSubmiting(false);
    }
  };

  const handleVerificationSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault(); // prevents page refresh

    if (!isLoaded || !signUp) return <h1>Loading...</h1>;

    setIsSubmiting(true);
    setAuthError(null);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      console.log(result);

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else {
        console.error("Verification incomplete", result);
        setVerificationError("Verification Error: Please try again");
      }
    } catch (error: any) {
      console.error("Error when handling verification: ", error);
      setVerificationError(
        error.errors?.[0]?.message ||
          "Something went wrong when verifying the code"
      );
    } finally {
      setIsSubmiting(false);
    }
  };

  if (verifying) {
    return (
      <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
        <CardHeader className="flex flex-col gap-1 items-center pb-2">
          <h1 className="text-2xl font-bold text-default-900">
            Verify Your Email
          </h1>
          <p className="text-default-500 text-center">
            We have sent you a verification code to your email address.
          </p>
        </CardHeader>
        <Divider />
        <CardBody className="py-6">
          {verificationError && (
            <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
              <CircleAlert className="size-5 flex-shrink-0" />
              <p className="text-sm">{verificationError}</p>
            </div>
          )}

          <form onSubmit={handleVerificationSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="verificationCode"
                className="text-sm font-medium text-default-900"
              >
                Verification Code
              </label>
              <Input
                id="verificationCode"
                type="text"
                placeholder="Enter the 6 digit Verification Code"
                className="w-full rounded-lg border border-default-200 bg-default-50 p-2 text-sm text-default-900 placeholder:text-default-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                onChange={(e) =>
                  setVerificationCode(e.target.value)
                }
                autoFocus
              />
            </div>
            <Button
              type="submit"
              color="primary"
              className="w-full"
              isLoading={isSubmiting}
            >
              {isSubmiting ? "Verifying..." : "Verify Email"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-default-500">
              Did not recieve the code?{" "}
              <button
                onClick={async () => {
                  if (signUp) {
                    await signUp.prepareEmailAddressVerification({
                      strategy: "email_code",
                    });
                  }
                }}
                className="text-primary hover:underline font-medium"
              >
                Resend Code
              </button>
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return <h1>SignUp form</h1>;
}
