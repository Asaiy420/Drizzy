import { loginSchema } from "@/schemas/loginSchema";
import { useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {z} from "zod";   
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Input } from "@heroui/input";
import {
    Mail,
    Lock,
    AlertCircle,
    Eye,
    EyeOff,
  } from "lucide-react";
import Link from "next/link";

export default function SignInForm(){


    const router = useRouter();
    const {signIn, isLoaded, setActive} = useSignIn();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);



    const {register, handleSubmit, formState: {errors}} = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            identifier: "",
            password: "",
        },
    })

    const onSubmit = async (data: z.infer<typeof loginSchema>) => {
        if (!isLoaded) return;

        setIsSubmitting(true);
        setAuthError(null);


        try {
           const result = await signIn.create({
                identifier: data.identifier,
                password: data.password,
            })

            if (result.status === "complete"){
                await setActive({session: result.createdSessionId})
                router.push("/dashboard")

            }else{
                console.error("Login incomplete:", result);
                setAuthError("Login could not be completed. Please try again.")
            }

        } catch (error: any) {
            setAuthError(error.errors?.[0]?.message || "An error occurred during login. Please try again.")
        }finally {
            setIsSubmitting(false);
        }
    }


    return (
        <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
          <CardHeader className="flex flex-col gap-1 items-center pb-2">
            <h1 className="text-2xl font-bold text-default-900">
              Welcome Back!
            </h1>
            <p className="text-default-500 text-center">
              Login to access your drizzy storage
            </p>
          </CardHeader>
    
          <Divider />
    
          <CardBody className="py-6">
            {authError && (
              <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{authError}</p>
              </div>
            )}
    
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-default-900"
                >
                  Email
                </label>
                <Input
                  id="identifier"
                  type="email"
                  placeholder="your.email@example.com"
                  startContent={<Mail className="h-4 w-4 text-default-500" />}
                  isInvalid={!!errors.identifier}
                  errorMessage={errors.identifier?.message}
                  {...register("identifier")}
                  className="w-full"
                />
              </div>
    
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-default-900"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  startContent={<Lock className="h-4 w-4 text-default-500" />}
                  endContent={
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-default-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-default-500" />
                      )}
                    </Button>
                  }
                  isInvalid={!!errors.password}
                  errorMessage={errors.password?.message}
                  {...register("password")}
                  className="w-full"
                />
              </div>
              <Button
                type="submit"
                color="primary"
                className="w-full"
                isLoading={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardBody>
    
          <Divider />
    
          <CardFooter className="flex justify-center py-4">
            <p className="text-sm text-default-600">
              Do not have an account?{" "}
              <Link
                href="/sign-up"
                className="text-primary hover:underline font-medium"
              >
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </Card>
      );
}
