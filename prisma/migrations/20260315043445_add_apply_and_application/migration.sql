-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "applyLink" TEXT,
ADD COLUMN     "applyMode" TEXT NOT NULL DEFAULT 'form';

-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "roleWanted" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
